require('dotenv').config();
const mysql = require("mysql2/promise");

// Configurações de conexão com o banco de dados
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "Izzi_Fitness",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Cria um pool de conexões para melhor performance e gerenciamento
const pool = mysql.createPool(dbConfig);

// Função para testar a conexão
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Conexão com o banco de dados estabelecida com sucesso!");
        connection.release(); // Libera a conexão de volta para o pool
    } catch (error) {
        console.error("Erro crítico ao conectar com o banco de dados:", error.message);
        console.error("Verifique se o MySQL está rodando e se as credenciais no .env estão corretas.");
        // Não encerra o processo para permitir retentativas ou tratamento posterior,
        // mas em produção isso poderia ser fatal.
    }
}

testConnection();

module.exports = pool;
