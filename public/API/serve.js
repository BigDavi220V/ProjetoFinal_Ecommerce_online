require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors"); // Permite requisições de outros domínios
const db = require("./db"); // Módulo de conexão com o banco de dados
const multer = require("multer");
const fs = require("fs");

// Configuração do Multer para Upload de Imagens
const uploadDir = path.join(__dirname, "../assets/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
    const { nome, email, senha, telefone, lgpd, cpf, rua, numero, bairro, cidade, uf } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    if (!lgpd) {
        return res.status(400).json({ error: "Você deve concordar com os Termos de Uso e LGPD." });
    }

    try {
        // 1. Gerar o hash da senha
        const senha_hash = await bcrypt.hash(senha, saltRounds);

        // Formatar endereço se fornecido
        let enderecoCompleto = null;
        if (rua || cidade || uf) {
            enderecoCompleto = `${rua || ''}, ${numero || 'S/N'} - ${bairro || ''}, ${cidade || ''} - ${uf || ''}`;
        }

        // 2. Inserir o novo usuário na tabela 'usuarios'
        // Verifica se colunas extras existem (assumindo que initAdminDB rodou)
        const sql =
            "INSERT INTO usuarios (nome_completo, email, senha_hash, telefone, lgpd_consentimento, cpf_cnpj, endereco) VALUES (?, ?, ?, ?, ?, ?, ?)";

        await db.query(sql, [nome, email, senha_hash, telefone || null, true, cpf || null, enderecoCompleto]);

        // 3. Resposta de sucesso
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);

        // Erro de duplicidade (ex: email já cadastrado)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Este e-mail já está cadastrado." });
        }

        res.status(500).json({ error: "Erro interno ao salvar no banco de dados." });
    }
});

// =================================================================
// ROTA DE LOGIN
// =================================================================
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        // 1. Buscar o usuário pelo e-mail
        const sql = "SELECT id, senha_hash FROM usuarios WHERE email = ?";
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            // Usuário não encontrado
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        const usuario = results[0];

        // 2. Comparar a senha fornecida com o hash armazenado
        const match = await bcrypt.compare(senha, usuario.senha_hash);

        if (match) {
            // Login bem-sucedido
            // Em um projeto real, você criaria uma sessão ou um token JWT aqui.
            console.log(`Usuário ${usuario.id} logado com sucesso.`);
            // return res.redirect("/home.html"); // Comentado para uso via API
            
            // Verificar se é admin (checando campo is_admin do banco se existir, ou hardcoded se preferir, mas DB é melhor)
            // Nota: O SELECT acima já deve trazer is_admin se a coluna existir. Vamos garantir no SELECT.
            const [userFull] = await db.query("SELECT is_admin FROM usuarios WHERE id = ?", [usuario.id]);
            const isAdmin = userFull[0].is_admin;

            return res.status(200).json({ 
                message: "Login realizado com sucesso", 
                userId: usuario.id,
                isAdmin: !!isAdmin 
            });
        } else {
            // Senha incorreta
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        res.status(500).json({ error: "Erro interno ao fazer login." });
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
        const [rows] = await db.query("SELECT id, nome_completo, email, telefone, data_cadastro, endereco, cpf_cnpj FROM usuarios WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).send("Cliente não encontrado.");
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send("Erro ao buscar cliente.");
    }
});

// Atualizar dados do cliente
app.put("/clientes/:id", async (req, res) => {
    const { nome_completo, telefone, endereco, cpf_cnpj } = req.body;
    try {
        await db.query("UPDATE usuarios SET nome_completo = ?, telefone = ?, endereco = ?, cpf_cnpj = ? WHERE id = ?", [nome_completo, telefone, endereco, cpf_cnpj, req.params.id]);
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
    const { usuario_id, endereco_id, metodo_pagamento, status_pedido, items } = req.body; // endereco_id seria usado para vincular entrega
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let itensParaPedido = [];

        if (items && items.length > 0) {
            // Modo Frontend: Itens enviados no corpo da requisição
            itensParaPedido = items.map(item => ({
                produto_id: item.product.id || item.produto_id, // Suporta ambos os formatos
                quantidade: item.quantity || item.quantidade,
                preco: item.product.price || item.preco
            }));
        } else {
            // Modo Banco: Buscar itens da tabela itens_carrinho
            const [rows] = await connection.query(`
                SELECT ic.produto_id, ic.quantidade, p.preco 
                FROM itens_carrinho ic
                JOIN carrinho c ON ic.carrinho_id = c.id
                JOIN produtos p ON ic.produto_id = p.id
                WHERE c.usuario_id = ?
            `, [usuario_id]);
            itensParaPedido = rows;
        }

        if (itensParaPedido.length === 0) {
            throw new Error("Carrinho vazio.");
        }

        // 2. Calcular total
        const total = itensParaPedido.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // 3. Criar Pedido
        const status = status_pedido || 'pendente';
        const metodo = metodo_pagamento || 'nao_informado';
        const [pedidoResult] = await connection.query("INSERT INTO pedidos (usuario_id, valor_total, status_pedido, metodo_pagamento) VALUES (?, ?, ?, ?)", [usuario_id, total, status, metodo]);
        const pedidoId = pedidoResult.insertId;

        // 4. Inserir Itens do Pedido e Baixar Estoque
        for (const item of itensParaPedido) {
            await connection.query("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", [pedidoId, item.produto_id, item.quantidade, item.preco]);
            
            // Atualizar estoque
            await connection.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [item.quantidade, item.produto_id]);
        }

        // 5. Limpar Carrinho (Apenas se usou o banco)
        if (!items) {
            await connection.query("DELETE ic FROM itens_carrinho ic JOIN carrinho c ON ic.carrinho_id = c.id WHERE c.usuario_id = ?", [usuario_id]);
        }

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
// MÓDULO ADMINISTRATIVO (ADM)
// =================================================================

// Inicializar tabelas extras e Admin
async function initAdminDB() {
    try {
        // 1. Galeria de Produtos
        const sqlGaleria = `
            CREATE TABLE IF NOT EXISTS galeria_produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                produto_id INT NOT NULL,
                imagem_url VARCHAR(255) NOT NULL,
                FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
            )
        `;
        await db.query(sqlGaleria);
        console.log("Tabela 'galeria_produtos' verificada/criada.");

        // 2. Atualizar Tabela de Usuários (Schema Update)
        const columnsToAdd = [
            "ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE",
            "ADD COLUMN IF NOT EXISTS lgpd_consentimento BOOLEAN DEFAULT FALSE",
            "ADD COLUMN IF NOT EXISTS endereco TEXT",
            "ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20)"
        ];

        for (const col of columnsToAdd) {
            try {
                await db.query(`ALTER TABLE usuarios ${col}`);
            } catch (e) {
                // Ignorar erro se coluna já existir (alguns DBs não suportam IF NOT EXISTS no ADD COLUMN)
                console.log(`Nota: Coluna pode já existir ou erro ao adicionar: ${col}`);
            }
        }
        console.log("Schema da tabela 'usuarios' verificado/atualizado.");

        // 3. Criar Usuário Admin Padrão
        const adminEmail = "naisy@izzifitness.com.br";
        const [existingAdmin] = await db.query("SELECT id FROM usuarios WHERE email = ?", [adminEmail]);

        if (existingAdmin.length === 0) {
            const adminPass = "Naisy@Admin1931";
            const adminHash = await bcrypt.hash(adminPass, 10);
            await db.query(
                "INSERT INTO usuarios (nome_completo, email, senha_hash, is_admin, lgpd_consentimento) VALUES (?, ?, ?, TRUE, TRUE)",
                ["Administrador Sistema", adminEmail, adminHash]
            );
            console.log("Usuário Admin padrão criado com sucesso.");
        } else {
            // Garantir que seja admin
            await db.query("UPDATE usuarios SET is_admin = TRUE WHERE email = ?", [adminEmail]);
            console.log("Usuário Admin já existe (permissão confirmada).");
        }

    } catch (error) {
        console.error("Erro ao inicializar banco admin:", error);
    }
}
initAdminDB();

// Dashboard Stats
app.get("/admin/stats", async (req, res) => {
    try {
        const [users] = await db.query("SELECT COUNT(*) as total FROM usuarios");
        const [orders] = await db.query("SELECT COUNT(*) as total FROM pedidos");
        const [lowStock] = await db.query("SELECT COUNT(*) as total FROM produtos WHERE estoque < 10"); // Exemplo de estoque baixo
        const [revenue] = await db.query("SELECT SUM(valor_total) as total FROM pedidos WHERE status_pedido != 'cancelado'");

        res.json({
            total_usuarios: users[0].total,
            total_pedidos: orders[0].total,
            produtos_estoque_baixo: lowStock[0].total,
            receita_total: revenue[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar estatísticas." });
    }
});

// Gerenciar Usuários
app.get("/admin/usuarios", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, nome_completo, email, data_cadastro FROM usuarios ORDER BY data_cadastro DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar usuários." });
    }
});

// Gerenciar Pedidos
app.get("/admin/pedidos", async (req, res) => {
    try {
        const sql = `
            SELECT p.id, p.data_pedido, p.status_pedido, p.valor_total, u.nome_completo as cliente
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.data_pedido DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar pedidos." });
    }
});

app.put("/admin/pedidos/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
        await db.query("UPDATE pedidos SET status_pedido = ? WHERE id = ?", [status, req.params.id]);
        res.json({ message: "Status do pedido atualizado." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar pedido." });
    }
});

// Cadastro de Produto com Upload (Sobrescrevendo/Complementando a rota existente se necessário, ou criando nova rota admin)
// Nota: A rota POST /produtos existente não tem upload. Vamos criar uma específica para admin com upload.
app.post("/admin/produtos", upload.single('imagem'), async (req, res) => {
    const { nome, descricao, preco, estoque, categoria_id } = req.body;
    const imagem_url = req.file ? `/assets/uploads/${req.file.filename}` : null;

    if (!nome || !preco || !estoque) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    try {
        const sql = "INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, imagem_url) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [nome, descricao, preco, estoque, categoria_id, imagem_url]);
        
        res.status(201).json({ id: result.insertId, message: "Produto criado com sucesso!", imagem_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar produto." });
    }
});

// Remover Produto (Admin)
app.delete("/admin/produtos/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM produtos WHERE id = ?", [req.params.id]);
        res.json({ message: "Produto removido com sucesso." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover produto." });
    }
});
//
// Upload de Galeria (Múltiplas Imagens)
app.post("/admin/produtos/:id/galeria", upload.array('imagens', 5), async (req, res) => {
    const produtoId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    try {
        const values = files.map(file => [produtoId, `/assets/uploads/${file.filename}`]);
        const sql = "INSERT INTO galeria_produtos (produto_id, imagem_url) VALUES ?";
        
        await db.query(sql, [values]);
        res.status(201).json({ message: `${files.length} imagens adicionadas à galeria.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar galeria." });
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
