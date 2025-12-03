require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
    // 1. Conexão inicial sem especificar banco de dados para poder criá-lo
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD
    });

    try {
        console.log('Conectado ao MySQL.');

        // 2. Criar banco de dados se não existir
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'Izzi_Fitness'}`);
        console.log(`Banco de dados '${process.env.DB_NAME || 'Izzi_Fitness'}' verificado/criado.`);

        // 3. Usar o banco de dados
        await connection.changeUser({ database: process.env.DB_NAME || 'Izzi_Fitness' });

        // 4. Criar tabelas
        const tables = [
            `CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome_completo VARCHAR(200) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha_hash VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ativo BOOLEAN DEFAULT TRUE,
                tipo_usuario ENUM('cliente', 'admin') DEFAULT 'cliente'
            )`,
            `CREATE TABLE IF NOT EXISTS categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE,
                descricao TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                estoque INT NOT NULL DEFAULT 0,
                categoria_id INT,
                imagem_url VARCHAR(255),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            )`,
            `CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status_pedido ENUM('pendente', 'processando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
                valor_total DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )`,
            `CREATE TABLE IF NOT EXISTS itens_pedido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pedido_id INT NOT NULL,
                produto_id INT NOT NULL,
                quantidade INT NOT NULL,
                preco_unitario DECIMAL(10, 2) NOT NULL,
                tamanho VARCHAR(10),
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
                FOREIGN KEY (produto_id) REFERENCES produtos(id),
                UNIQUE KEY uk_pedido_produto_tamanho (pedido_id, produto_id, tamanho)
            )`,
            `CREATE TABLE IF NOT EXISTS enderecos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                tipo ENUM('entrega', 'cobranca') NOT NULL,
                logradouro VARCHAR(255) NOT NULL,
                numero VARCHAR(50),
                complemento VARCHAR(100),
                bairro VARCHAR(100),
                cidade VARCHAR(100) NOT NULL,
                estado CHAR(2) NOT NULL,
                cep VARCHAR(10) NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )`,
            `CREATE TABLE IF NOT EXISTS avaliacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                produto_id INT NOT NULL,
                usuario_id INT NOT NULL,
                nota INT CHECK (nota BETWEEN 1 AND 5),
                comentario TEXT,
                data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (produto_id) REFERENCES produtos(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                UNIQUE KEY uk_produto_usuario (produto_id, usuario_id)
            )`,
            `CREATE TABLE IF NOT EXISTS carrinho (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL UNIQUE,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )`,
            `CREATE TABLE IF NOT EXISTS itens_carrinho (
                id INT AUTO_INCREMENT PRIMARY KEY,
                carrinho_id INT NOT NULL,
                produto_id INT NOT NULL,
                quantidade INT NOT NULL,
                tamanho VARCHAR(10),
                FOREIGN KEY (carrinho_id) REFERENCES carrinho(id),
                FOREIGN KEY (produto_id) REFERENCES produtos(id),
                UNIQUE KEY uk_carrinho_produto_tamanho (carrinho_id, produto_id, tamanho)
            )`,
            `CREATE TABLE IF NOT EXISTS galeria_produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                produto_id INT NOT NULL,
                imagem_url VARCHAR(255) NOT NULL,
                FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
            )`
        ];

        for (const sql of tables) {
            await connection.query(sql);
        }
        console.log('Tabelas verificadas/criadas com sucesso.');

        // 5. Popular produtos se estiver vazio
        const [rows] = await connection.query("SELECT COUNT(*) as count FROM produtos");
        if (rows[0].count === 0) {
            console.log("Tabela de produtos vazia. Populando...");
            const products = [
                { name: 'LEG ROXO', price: 100.00, image: 'assets/Modelo_01.png' },
                { name: 'LEG VERDE ÁGUA', price: 100.00, image: 'assets/Modelo_02.png' },
                { name: 'LEG AZUL ESCURO', price: 100.00, image: 'assets/Modelo_03.png' },
                { name: 'LEG VERMELHO ESCURO', price: 100.00, image: 'assets/Modelo_04.png' },
                { name: 'LEG VERMELHO CLARO', price: 100.00, image: 'assets/Modelo_05.png' },
                { name: 'LEG VINHO', price: 100.00, image: 'assets/assets IA/Modelo_vermelho01.png' },
                { name: 'LEG PRETO', price: 100.00, image: 'assets/assets IA/Modelo_Preto01.png' },
                { name: 'LEG TURQUESA', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Turquesa01.png' },
                { name: 'LEG MARINHO', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Escuro01.png' },
                { 
                  name: 'LEG BLACK', 
                  price: 100.00, 
                  image: 'assets/10_card/Modelo_01.png',
                  description: 'A Legging Black Basic é a peça essencial que não pode faltar no seu guarda-roupa fitness.'
                },
                { name: 'LEG VERDE', price: 100.00, image: 'assets/11_card/Modelo_01.png' },	
            ];

            for (const p of products) {
                await connection.query(
                    "INSERT INTO produtos (nome, preco, imagem_url, descricao, estoque) VALUES (?, ?, ?, ?, ?)",
                    [p.name, p.price, p.image, p.description || '', 100]
                );
            }
            console.log("Produtos inseridos.");
        } else {
            console.log("Produtos já existem.");
        }

    } catch (error) {
        console.error('Erro no setup do banco:', error);
    } finally {
        await connection.end();
    }
}

setupDatabase();
