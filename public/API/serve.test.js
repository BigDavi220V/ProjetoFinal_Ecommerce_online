const request = require('supertest');
const app = require('./serve');
const db = require('./db');
const bcrypt = require('bcrypt');

// Mock do módulo db
jest.mock('./db', () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn()
}));

describe('API Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Teste de Login
    describe('POST /login', () => {
        it('deve realizar login com sucesso e retornar JSON', async () => {
            const mockUser = { id: 1, senha_hash: 'hash' };
            db.query.mockResolvedValue([[mockUser]]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/login')
                .send({ email: 'teste@teste.com', senha: '123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login realizado com sucesso');
            expect(res.body).toHaveProperty('userId', 1);
        });

        it('deve falhar com credenciais inválidas', async () => {
            const mockUser = { id: 1, senha_hash: 'hash' };
            db.query.mockResolvedValue([[mockUser]]);
            bcrypt.compare.mockResolvedValue(false); // Senha errada

            const res = await request(app)
                .post('/login')
                .send({ email: 'teste@teste.com', senha: 'errada' });

            expect(res.statusCode).toEqual(401);
        });
    });

    // Teste de Recuperação de Senha
    describe('POST /recuperar-senha', () => {
        it('deve retornar sucesso se email for fornecido', async () => {
            // Mock da query para retornar usuário encontrado
            db.query.mockResolvedValue([[{ id: 1 }]]);

            const res = await request(app)
                .post('/recuperar-senha')
                .send({ email: 'teste@teste.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('instruções foram enviadas');
        });

        it('deve retornar 400 se email não for fornecido', async () => {
            const res = await request(app)
                .post('/recuperar-senha')
                .send({});

            expect(res.statusCode).toEqual(400);
        });
    });

    // Teste de Clientes
    describe('GET /clientes/:id', () => {
        it('deve retornar dados do cliente', async () => {
            const mockUser = { id: 1, nome_completo: 'Teste', email: 'teste@teste.com' };
            db.query.mockResolvedValue([[mockUser]]);

            const res = await request(app).get('/clientes/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUser);
        });

        it('deve retornar 404 se cliente não encontrado', async () => {
            db.query.mockResolvedValue([[]]); // Retorna array vazio

            const res = await request(app).get('/clientes/999');

            expect(res.statusCode).toEqual(404);
        });
    });

    // Teste de Produtos
    describe('GET /produtos', () => {
        it('deve retornar lista de produtos', async () => {
            const mockProducts = [{ id: 1, nome: 'Produto 1' }];
            db.query.mockResolvedValue([mockProducts]); // Ajuste para compatibilidade com destructuring

            const res = await request(app).get('/produtos');

            expect(res.statusCode).toEqual(200);
        });
    });

    // Teste de Cadastro
    describe('POST /cadastrar', () => {
        it('deve cadastrar usuário com sucesso incluindo telefone', async () => {
            db.query.mockResolvedValue([{ insertId: 1 }]);
            
            const newUser = {
                nome: 'Novo Usuario',
                email: 'novo@teste.com',
                senha: '123',
                telefone: '(11) 99999-9999'
            };

            const res = await request(app)
                .post('/cadastrar')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Usuário cadastrado com sucesso!');
            
            // Verificar se o db.query foi chamado com os argumentos corretos
            // A query é a segunda chamada no código (a primeira é o hash do bcrypt que não usa db, mas o db.query é chamado uma vez)
            // Esperamos que o mock do db.query tenha sido chamado com os parametros
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO usuarios'),
                expect.arrayContaining(['Novo Usuario', 'novo@teste.com', 'hashed_password', '(11) 99999-9999'])
            );
        });

        it('deve falhar se campos obrigatórios estiverem faltando', async () => {
            const res = await request(app)
                .post('/cadastrar')
                .send({ nome: 'Sem Email' });

            expect(res.statusCode).toEqual(400);
        });
    });
});
