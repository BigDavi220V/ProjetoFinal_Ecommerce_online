require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors"); // Permite requisições de outros domínios
const db = require("./db"); // Módulo de conexão com o banco de dados

const app = express();
const PORT = process.env.PORT || 2009;
const saltRounds = 10; // Custo do hash para bcrypt

// Configuração do Middleware
app.use(cors()); // Habilita CORS para todas as rotas
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Para lidar com requisições JSON (boas práticas de API)

// Middleware de Log de Requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
// ROTA DE RECUPERAÇÃO DE SENHA (SIMULADA)
// =================================================================
app.post("/recuperar-senha", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send("E-mail é obrigatório.");

    try {
        const [users] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (users.length === 0) {
            // Por segurança, não informamos se o e-mail existe ou não
            return res.status(200).send("Se o e-mail existir, as instruções foram enviadas.");
        }
        // Simulação de envio de e-mail
        console.log(`[SIMULAÇÃO] Recuperação de senha solicitada para: ${email}`);
        res.status(200).send("Se o e-mail existir, as instruções foram enviadas.");
    } catch (error) {
        console.error("Erro na recuperação de senha:", error);
        res.status(500).send("Erro interno.");
    }
});

// =================================================================
// MÓDULO DE CLIENTES
// =================================================================
// Obter dados do cliente
app.get("/clientes/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, nome_completo, email, telefone, data_cadastro FROM usuarios WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).send("Cliente não encontrado.");
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send("Erro ao buscar cliente.");
    }
});

// Atualizar dados do cliente
app.put("/clientes/:id", async (req, res) => {
    const { nome_completo, telefone } = req.body;
    try {
        await db.query("UPDATE usuarios SET nome_completo = ?, telefone = ? WHERE id = ?", [nome_completo, telefone, req.params.id]);
        res.send("Dados atualizados com sucesso.");
    } catch (error) {
        res.status(500).send("Erro ao atualizar cliente.");
    }
});

// Histórico de compras
app.get("/clientes/:id/compras", async (req, res) => {
    try {
        const sql = `
            SELECT p.id, p.data_pedido, p.status_pedido, p.valor_total, 
                   (SELECT COUNT(*) FROM itens_pedido ip WHERE ip.pedido_id = p.id) as total_itens
            FROM pedidos p
            WHERE p.usuario_id = ?
            ORDER BY p.data_pedido DESC
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).send("Erro ao buscar histórico de compras.");
    }
});

// =================================================================
// MÓDULO DE ESTOQUE E PRODUTOS
// =================================================================
// Listar categorias
app.get("/categorias", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categorias");
        res.json(rows);
    } catch (error) {
        res.status(500).send("Erro ao buscar categorias.");
    }
});

// Listar produtos (com filtro opcional por categoria)
app.get("/produtos", async (req, res) => {
    const { categoria_id } = req.query;
    let sql = "SELECT * FROM produtos";
    let params = [];

    if (categoria_id) {
        sql += " WHERE categoria_id = ?";
        params.push(categoria_id);
    }
    
    try {
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).send("Erro ao buscar produtos.");
    }
});

// Detalhes do produto
app.get("/produtos/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM produtos WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).send("Produto não encontrado.");
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send("Erro ao buscar produto.");
    }
});

// Adicionar Produto (Admin)
app.post("/produtos", async (req, res) => {
    const { nome, descricao, preco, estoque, categoria_id, imagem_url } = req.body;
    try {
        const sql = "INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, imagem_url) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [nome, descricao, preco, estoque, categoria_id, imagem_url]);
        res.status(201).json({ id: result.insertId, message: "Produto criado com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao criar produto.");
    }
});

// Atualizar Produto/Estoque
app.put("/produtos/:id", async (req, res) => {
    const { nome, preco, estoque } = req.body;
    // Atualização parcial simplificada
    try {
        await db.query("UPDATE produtos SET nome = COALESCE(?, nome), preco = COALESCE(?, preco), estoque = COALESCE(?, estoque) WHERE id = ?", [nome, preco, estoque, req.params.id]);
        res.send("Produto atualizado.");
    } catch (error) {
        res.status(500).send("Erro ao atualizar produto.");
    }
});

// =================================================================
// MÓDULO DE VENDAS E CARRINHO
// =================================================================
// Adicionar ao carrinho
app.post("/carrinho", async (req, res) => {
    const { usuario_id, produto_id, quantidade } = req.body;
    try {
        // 1. Verificar se usuário tem carrinho
        let [carrinho] = await db.query("SELECT id FROM carrinho WHERE usuario_id = ?", [usuario_id]);
        let carrinhoId;

        if (carrinho.length === 0) {
            const [result] = await db.query("INSERT INTO carrinho (usuario_id) VALUES (?)", [usuario_id]);
            carrinhoId = result.insertId;
        } else {
            carrinhoId = carrinho[0].id;
        }

        // 2. Adicionar ou atualizar item
        const sql = `
            INSERT INTO itens_carrinho (carrinho_id, produto_id, quantidade) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantidade = quantidade + VALUES(quantidade)
        `;
        await db.query(sql, [carrinhoId, produto_id, quantidade]);
        res.status(201).send("Item adicionado ao carrinho.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao adicionar ao carrinho.");
    }
});

// Ver carrinho
app.get("/carrinho/:usuario_id", async (req, res) => {
    try {
        const sql = `
            SELECT ic.id, p.nome, p.preco, ic.quantidade, (p.preco * ic.quantidade) as subtotal
            FROM itens_carrinho ic
            JOIN carrinho c ON ic.carrinho_id = c.id
            JOIN produtos p ON ic.produto_id = p.id
            WHERE c.usuario_id = ?
        `;
        const [rows] = await db.query(sql, [req.params.usuario_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).send("Erro ao buscar carrinho.");
    }
});

// Checkout (Transformar carrinho em pedido)
app.post("/checkout", async (req, res) => {
    const { usuario_id, endereco_id } = req.body; // endereco_id seria usado para vincular entrega
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Buscar itens do carrinho
        const [itens] = await connection.query(`
            SELECT ic.produto_id, ic.quantidade, p.preco 
            FROM itens_carrinho ic
            JOIN carrinho c ON ic.carrinho_id = c.id
            JOIN produtos p ON ic.produto_id = p.id
            WHERE c.usuario_id = ?
        `, [usuario_id]);

        if (itens.length === 0) {
            throw new Error("Carrinho vazio.");
        }

        // 2. Calcular total
        const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // 3. Criar Pedido
        const [pedidoResult] = await connection.query("INSERT INTO pedidos (usuario_id, valor_total, status_pedido) VALUES (?, ?, 'pendente')", [usuario_id, total]);
        const pedidoId = pedidoResult.insertId;

        // 4. Inserir Itens do Pedido e Baixar Estoque
        for (const item of itens) {
            await connection.query("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", [pedidoId, item.produto_id, item.quantidade, item.preco]);
            
            // Atualizar estoque
            await connection.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [item.quantidade, item.produto_id]);
        }

        // 5. Limpar Carrinho
        await connection.query("DELETE ic FROM itens_carrinho ic JOIN carrinho c ON ic.carrinho_id = c.id WHERE c.usuario_id = ?", [usuario_id]);

        await connection.commit();
        res.status(201).json({ message: "Pedido realizado com sucesso!", pedido_id: pedidoId });

    } catch (error) {
        await connection.rollback();
        console.error("Erro no checkout:", error);
        res.status(500).send(error.message || "Erro ao processar pedido.");
    } finally {
        connection.release();
    }
});

// =================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =================================================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Acesse a página de login em http://localhost:${PORT}/login.html`);
    });
}

module.exports = app;
