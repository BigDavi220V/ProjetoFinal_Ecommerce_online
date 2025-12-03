require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Configuração
const DOMAIN = process.env.ADMIN_EMAIL_DOMAIN || 'izzi.com';

// Função para gerar senha forte
function generateStrongPassword(length = 16) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function createAdmin() {
    const adminEmail = `admin@${DOMAIN}`;
    const plainPassword = generateStrongPassword();
    
    try {
        console.log(`[Admin Setup] Verificando existência do admin: ${adminEmail}`);
        
        // Verifica se já existe
        const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [adminEmail]);
        
        if (rows.length > 0) {
            console.log("[Admin Setup] Usuário admin já existe. Nenhuma ação tomada.");
            console.log("[Admin Setup] Caso precise resetar, delete o usuário do banco manualmente.");
        } else {
            // Cria novo admin
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
            await db.query(
                "INSERT INTO usuarios (nome_completo, email, senha_hash, tipo_usuario, ativo) VALUES (?, ?, ?, 'admin', true)",
                ['Administrador do Sistema', adminEmail, hashedPassword]
            );
            
            console.log("============================================================");
            console.log(" ADMINISTRADOR CRIADO COM SUCESSO ");
            console.log("============================================================");
            console.log(` Login: ${adminEmail}`);
            console.log(` Senha: ${plainPassword}`);
            console.log("============================================================");
            console.log(" GUARDE ESTA SENHA EM LOCAL SEGURO! ELA NÃO SERÁ EXIBIDA NOVAMENTE.");
            console.log("============================================================");
        }
        
    } catch (error) {
        console.error("[Admin Setup] Erro ao criar admin:", error);
    } finally {
        process.exit(0);
    }
}

createAdmin();
