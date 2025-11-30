const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./db"); // Módulo de conexão com o banco de dados

const app = express();
const PORT = 2009;
const saltRounds = 10; // Custo do hash para bcrypt

// Configuração do Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Para lidar com requisições JSON (boas práticas de API)

// Servir arquivos estáticos (como o login.html)
app.use(express.static(path.join(__dirname, "public")));

// =================================================================
// ROTA DE CADASTRO (REGISTRO)
// =================================================================
app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send("Todos os campos são obrigatórios.");
    }

    try {
        // 1. Gerar o hash da senha
        const senha_hash = await bcrypt.hash(senha, saltRounds);

        // 2. Inserir o novo usuário na tabela 'usuarios' (do schema Izzi_Fitness_v2)
        const sql =
            "INSERT INTO usuarios (nome_completo, email, senha_hash) VALUES (?, ?, ?)";

        await db.query(sql, [nome, email, senha_hash]);

        // 3. Resposta de sucesso
        res.status(201).send("Usuário cadastrado com sucesso!");

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);

        // Erro de duplicidade (ex: email já cadastrado)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send("Este e-mail já está cadastrado.");
        }

        res.status(500).send("Erro interno ao salvar no banco de dados.");
    }
});

// =================================================================
// ROTA DE LOGIN
// =================================================================
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).send("E-mail e senha são obrigatórios.");
    }

    try {
        // 1. Buscar o usuário pelo e-mail
        const sql = "SELECT id, senha_hash FROM usuarios WHERE email = ?";
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            // Usuário não encontrado
            return res.status(401).send("E-mail ou senha inválidos.");
        }

        const usuario = results[0];

        // 2. Comparar a senha fornecida com o hash armazenado
        const match = await bcrypt.compare(senha, usuario.senha_hash);

        if (match) {
            // Login bem-sucedido
            // Em um projeto real, você criaria uma sessão ou um token JWT aqui.
            console.log(`Usuário ${usuario.id} logado com sucesso.`);
            return res.redirect("/home.html"); // Redireciona para a página inicial
        } else {
            // Senha incorreta
            return res.status(401).send("E-mail ou senha inválidos.");
        }

    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        res.status(500).send("Erro interno ao fazer login.");
    }
});

// =================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =================================================================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse a página de login em http://localhost:${PORT}/login.html`);
});
