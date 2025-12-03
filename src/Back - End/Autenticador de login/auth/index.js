require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
const http = require("http");

const app = express();

// Validação de variáveis de ambiente essenciais
const requiredEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "SESSION_SECRET"];
const missing = requiredEnv.filter((k) => !process.env[k]);
const ENV_OK = missing.length === 0;
if (!ENV_OK) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
}

const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";
const FRONTEND_LOGIN_URL = process.env.FRONTEND_LOGIN_URL || "http://localhost:4200/login";
const API_BASE = process.env.API_BASE_URL || "http://localhost:2009"; // API principal para upsert

app.set("trust proxy", 1);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "insecure-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Criptografia simples para tokens sensíveis
const ENC_KEY = process.env.TOKEN_ENC_KEY || crypto.randomBytes(32).toString("hex");
function encrypt(text) {
  if (!text) return "";
  const key = Buffer.from(ENC_KEY.slice(0, 64), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

// Associa/atualiza usuário na API principal (evita duplicidade)
function upsertGoogleUser(payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      API_BASE.replace("http://", "http://") + "/oauth/google",
      { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
          } catch {
            resolve({ status: res.statusCode, body: null });
          }
        });
      }
    );
    req.on("error", (err) => {
      console.error("Upsert error:", err.message);
      resolve({ status: 500, body: null });
    });
    req.write(data);
    req.end();
  });
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      // Guarda tokens criptografados e dados básicos na sessão
      req.session.google = {
        id: profile?.id,
        email: profile?.emails?.[0]?.value,
        name: profile?.displayName,
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        obtainedAt: Date.now(),
      };
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Página inicial simples
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

// Inicia fluxo OAuth com escopos adequados e refresh token
app.get(
  "/auth/google",
  (req, res, next) => {
    if (!ENV_OK) return res.status(500).json({ error: "OAuth env not configured" });
    return passport.authenticate("google", { scope: ["openid", "profile", "email"], accessType: "offline", prompt: "consent" })(req, res, next);
  }
);

// Callback OAuth
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-error" }),
  async (req, res) => {
    try {
      const email = encodeURIComponent(req.user?.emails?.[0]?.value || "");
      const name = encodeURIComponent(req.user?.displayName || "");
      const id = encodeURIComponent(req.user?.id || "");

      // Integração com API principal para upsert/associação
      const upsert = await upsertGoogleUser({
        google_id: req.session.google?.id,
        google_email: req.session.google?.email,
        name: req.session.google?.name,
        tokens: {
          access_encrypted: req.session.google?.accessToken,
          refresh_encrypted: req.session.google?.refreshToken,
          obtained_at: req.session.google?.obtainedAt,
        },
      });
      if (upsert.status >= 400) {
        console.warn("Upsert failed or API unavailable, proceeding with redirect.");
      }

      // Redireciona para a SPA com dados mínimos
      res.redirect(`${FRONTEND_LOGIN_URL}?google_email=${email}&name=${name}&google_id=${id}`);
    } catch (err) {
      console.error("Callback error:", err);
      res.redirect("/login-error");
    }
  }
);

// Status de autenticação
app.get("/auth/status", (req, res) => {
  const user = req.user ? { id: req.user.id, email: req.user.emails?.[0]?.value, name: req.user.displayName } : null;
  res.json({ authenticated: !!req.user, user });
});

// Logout seguro
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect("/"));
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log(`Auth server running at http://localhost:3000`);
});
