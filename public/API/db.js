const mysql = require("mysql2/promise");

// Configurações de conexão com o banco de dados
// ATENÇÃO: Em um ambiente de produção, estas credenciais devem ser carregadas
// de variáveis de ambiente (ex: process.env.DB_HOST) para maior segurança.
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "Futuro@2001", // Substitua pela sua senha real
    database: "Izzi_Fitness", // Usando o novo schema de e-commerce
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
        console.error("Erro ao conectar com o banco de dados:", error.message);
        // Em um ambiente real, você pode querer encerrar o processo aqui
        // process.exit(1);
    }
}

testConnection();

module.exports = pool;
