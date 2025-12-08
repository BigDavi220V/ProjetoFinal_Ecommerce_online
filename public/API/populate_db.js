const db = require('./db');

async function populate() {
    try {
        console.log("Verificando produtos...");
        const [rows] = await db.query("SELECT COUNT(*) as count FROM produtos");
        
        if (rows[0].count > 0) {
            console.log("Produtos já existem no banco. Pulando população.");
            process.exit(0);
        }

        console.log("Inserindo produtos de exemplo...");

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
            	
        ];

        for (const p of products) {
            await db.query(
                "INSERT INTO produtos (nome, preco, imagem_url, descricao, estoque) VALUES (?, ?, ?, ?, ?)",
                [p.name, p.price, p.image, p.description || '', 100]
            );
        }

        console.log("Produtos inseridos com sucesso!");
        process.exit(0);

    } catch (error) {
        console.error("Erro ao popular banco:", error);
        process.exit(1);
    }
}

populate();
