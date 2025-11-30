use Izzi_Fitness;

-- Script SQL para Criação da View de Histórico de Compras

-- Este script deve ser executado no banco de dados 'Izzi_Fitness_v2'
-- criado pelo script 'ecommerce_schema_v2.sql'.


-- 1. Criação da View 'historico_compras'
-- Esta View combina informações de pedidos, itens do pedido e produtos
-- para fornecer um histórico detalhado de todas as compras.

CREATE OR REPLACE VIEW historico_compras AS
SELECT
    p.usuario_id,
    p.id AS pedido_id,
    p.data_pedido,
    p.status_pedido,
    p.valor_total AS valor_total_pedido,
    ip.quantidade,
    ip.preco_unitario,
    (ip.quantidade * ip.preco_unitario) AS subtotal_item,
    prod.nome AS nome_produto,
    prod.imagem_url
FROM
    pedidos p
JOIN
    itens_pedido ip ON p.id = ip.pedido_id
JOIN
    produtos prod ON ip.produto_id = prod.id
ORDER BY
    p.data_pedido DESC, p.id;

-- 2. Exemplo de Uso da View
-- Para visualizar o histórico de compras de um usuário específico (ex: ID 1):


SELECT
    pedido_id AS "ID PEDIDO",
    data_pedido AS "DATA DO PEDIDO",
    status_pedido AS "STATUS DO PEDIDO",
    nome_produto AS "NOME DO PRODUTO",
    quantidade AS "QUANTIDADE",
    preco_unitario AS "PREÇO UNITÁRIO",
    subtotal_item AS "SUBTOTAL ITENS"
FROM
    historico_compras
WHERE
    usuario_id = 1;


-- Para visualizar todos os pedidos de todos os usuários:


SELECT * FROM historico_compras;

