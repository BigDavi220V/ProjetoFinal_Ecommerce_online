# Relatório de Discrepâncias: Cadastro vs Banco de Dados

## 1. Análise de Campos

| Campo no Formulário (Frontend) | Campo na API (Body) | Coluna no Banco de Dados (Tabela `usuarios`) | Status | Ação Realizada |
| :--- | :--- | :--- | :--- | :--- |
| `nome` | `nome` | `nome_completo` | Funcional | Mapeamento mantido na API. |
| `email` | `email` | `email` | Consistente | Nenhuma ação necessária. |
| `senha` | `senha` | `senha_hash` | Consistente | Hash gerado no backend. |
| `confirmarSenha` | N/A | N/A | Validação Frontend | Validação de igualdade mantida. |
| **Telefone** | `telefone` | `telefone` | **Implementado** | **Campo adicionado ao formulário e à API.** |

## 2. Alterações Realizadas

### Frontend
- **Arquivo:** `src/app/pages/cadastro/cadastro.component.html`
    - Adicionado campo de input para `telefone`.
- **Arquivo:** `src/app/pages/cadastro/cadastro.component.ts`
    - Adicionado controle `telefone` ao `FormGroup`.
    - Incluído `telefone` no objeto enviado ao serviço `UserService`.

### Backend
- **Arquivo:** `public/API/serve.js`
    - Endpoint `POST /cadastrar` atualizado para receber `telefone` do corpo da requisição.
    - Query SQL `INSERT` atualizada para persistir o telefone no banco de dados.

### Testes
- **Arquivo:** `public/API/serve.test.js`
    - Adicionado caso de teste para cadastro com telefone.
    - Verificado sucesso (201 Created) e chamada correta ao banco de dados.

## 3. Conclusão
O fluxo de cadastro agora está totalmente alinhado com a estrutura do banco de dados, permitindo a captura e persistência do telefone do usuário. A inconsistência de nomenclatura `nome` vs `nome_completo` foi gerenciada na camada de API, mantendo o contrato estável.
