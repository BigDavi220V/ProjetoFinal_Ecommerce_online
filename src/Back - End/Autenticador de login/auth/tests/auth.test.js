const { spawn } = require('child_process');
const http = require('http');

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: 3000, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const env = {
    ...process.env,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    SESSION_SECRET: process.env.SESSION_SECRET || 'dummy-session-secret',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  };

  const child = spawn('node', ['index.js'], { cwd: __dirname + '/..', env, stdio: ['ignore', 'inherit', 'inherit'] });

  // aguarda servidor subir
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const health = await request('/health');
    if (health.status !== 200) throw new Error('Healthcheck falhou');

    const status = await request('/auth/status');
    const statusJson = JSON.parse(status.body || '{}');
    if (!('authenticated' in statusJson)) throw new Error('Status inválido');

    const google = await request('/auth/google');
    if (google.status !== 302) throw new Error('Redirecionamento Google não ocorreu');
    if (!google.headers.location || !google.headers.location.includes('accounts.google')) throw new Error('Location inválido para Google');

    console.log('PASS: health, status e redirecionamento Google');
  } catch (err) {
    console.error('FAIL:', err && err.stack ? err.stack : (err && err.message) || String(err));
    process.exitCode = 1;
  } finally {
    child.kill('SIGINT');
  }
})();

