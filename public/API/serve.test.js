const request = require('supertest');
const app = require('./serve');
const db = require('./db');
const bcrypt = require('bcrypt');

jest.mock('./db');
jest.mock('bcrypt');

describe('API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Teste de Produtos
    describe('GET /produtos', () => {
        it('deve retornar lista de produtos', async () => {
            const mockProducts = [{ id: 1, nome: 'Produto 1', preco: 10.0 }];
            db.query.mockResolvedValue([mockProducts]);

            const res = await request(app).get('/produtos');

            expect(res.statusCode).toEqual(200);
        });
    });

    // Teste de Cadastro
    describe('POST /cadastrar', () => {
        it('deve cadastrar usuário com sucesso incluindo telefone', async () => {
            db.query.mockResolvedValue([{ insertId: 1 }]);
            bcrypt.hash.mockResolvedValue('hashed_password');
            
            const newUser = {
                nome: 'Novo Usuario',
                email: 'novo@teste.com',
                senha: '123',
                telefone: '(11) 99999-9999',
                cpf: '12345678900',
                rua: 'Rua Teste',
                numero: '123',
                bairro: 'Bairro Teste',
                cidade: 'Cidade Teste',
                uf: 'SP',
                lgpd: true
            };

            const res = await request(app)
                .post('/cadastrar')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Usuário cadastrado com sucesso!');
            
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

    // Teste de Checkout
    describe('POST /checkout', () => {
        it('deve criar pedido com sucesso e salvar status e método de pagamento', async () => {
            const mockConnection = {
                beginTransaction: jest.fn(),
                query: jest.fn(),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            };
            db.getConnection.mockResolvedValue(mockConnection);

            // Mock steps:
            // 1. Get Items
            mockConnection.query.mockResolvedValueOnce([
                [{ produto_id: 1, quantidade: 2, preco: 100 }]
            ])
            // 2. Insert Pedido
            .mockResolvedValueOnce([{ insertId: 123 }])
            // 3. Insert Items
            .mockResolvedValueOnce([])
            // 4. Update Stock
            .mockResolvedValueOnce([])
            // 5. Delete Cart
            .mockResolvedValueOnce([]);

            const checkoutData = {
                usuario_id: 1,
                metodo_pagamento: 'boleto',
                status_pedido: 'Aguardando pagamento'
            };

            const res = await request(app)
                .post('/checkout')
                .send(checkoutData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('pedido_id', 123);
            
            // Verify Insert Pedido arguments
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO pedidos'),
                expect.arrayContaining([1, 200, 'Aguardando pagamento', 'boleto'])
            );
        });
    });
});
