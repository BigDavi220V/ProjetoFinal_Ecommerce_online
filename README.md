# Vista.Izzi - E-commerce Fitness

## 📋 Sobre o Projeto

O **Vista.Izzi** é uma plataforma de e-commerce completa voltada para o nicho de moda fitness. O projeto consiste em uma aplicação web moderna desenvolvida com Angular no frontend e uma API robusta em Node.js no backend, oferecendo funcionalidades como catálogo de produtos, carrinho de compras, checkout, autenticação de usuários (incluindo login social com Google) e um painel administrativo para gerenciamento de produtos e pedidos.

## 🛠️ Tecnologias e Requisitos

Para executar este projeto, você precisará das seguintes ferramentas instaladas em sua máquina:

*   **Node.js**: Versão 18.x ou superior (LTS recomendada).
*   **Angular CLI**: Versão 19.x (`npm install -g @angular/cli`).
*   **MySQL**: Banco de dados relacional.
*   **Git**: Para controle de versão.

### Stack Tecnológica

*   **Frontend**: Angular 19, TypeScript, HTML5, CSS3.
*   **Backend (API Principal)**: Node.js, Express, MySQL2.
*   **Serviço de Autenticação**: Node.js, Passport.js (Google OAuth).
*   **Banco de Dados**: MySQL.

---

## ⚙️ Configuração do Ambiente

Siga os passos abaixo para preparar o ambiente de desenvolvimento.

### 1. Banco de Dados (MySQL)

1.  Certifique-se de que o serviço do MySQL está rodando.
2.  Crie um banco de dados chamado `Izzi_Fitness`.
3.  Execute os scripts SQL localizados na pasta `public/Banco` na seguinte ordem:
    *   `Banco_Dados.sql`: Criação das tabelas e estrutura inicial.
    *   `historico_compras_view.sql`: Criação de views para relatórios.

### 2. Backend (API Principal)

Esta API gerencia produtos, usuários e pedidos.

1.  Navegue até o diretório da API:
    ```bash
    cd public/API
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    *   Crie um arquivo `.env` na pasta `public/API` baseando-se no `.env.example`.
    *   Exemplo de configuração:
        ```env
        DB_HOST=localhost
        DB_USER=seu_usuario_mysql
        DB_PASSWORD=sua_senha_mysql
        DB_NAME=Izzi_Fitness
        PORT=2009
        JWT_SECRET=sua_chave_secreta_aqui
        ```

### 3. Serviço de Autenticação (Google OAuth)

Este serviço gerencia o login social com Google.

1.  Navegue até o diretório do autenticador:
    ```bash
    cd "src/Back - End/Autenticador de login/auth"
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` neste diretório com as seguintes chaves (você precisará criar credenciais no Google Cloud Console):
    ```env
    GOOGLE_CLIENT_ID=seu_client_id_google
    GOOGLE_CLIENT_SECRET=seu_client_secret_google
    SESSION_SECRET=segredo_da_sessao
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
    FRONTEND_LOGIN_URL=http://localhost:4200/login
    API_BASE_URL=http://localhost:2009
    PORT=3000
    ```

### 4. Frontend (Angular)

1.  Navegue até a raiz do projeto:
    ```bash
    cd ../../../..
    # Ou simplesmente volte para a raiz do projeto se estiver em outro terminal
    ```
2.  Instale as dependências do projeto:
    ```bash
    npm install
    ```

---

## 🚀 Executando o Projeto

Para o funcionamento completo, você precisará de **3 terminais** rodando simultaneamente.

### Terminal 1: API Principal

```bash
cd public/API
npm start
```
*   O servidor iniciará na porta **2009**.
*   Mensagem de sucesso esperada: `Servidor rodando na porta 2009`.

### Terminal 2: Serviço de Autenticação

```bash
cd "src/Back - End/Autenticador de login/auth"
npm start
```
*   O servidor iniciará na porta **3000**.

### Terminal 3: Frontend

Na raiz do projeto:

```bash
ng serve
```
*   A aplicação estará disponível em `http://localhost:4200/`.

---

## 📂 Estrutura do Projeto

```
ProjetoFinal_Ecommerce_online/
├── public/
│   ├── API/                  # Backend principal (Node.js/Express)
│   ├── Banco/                # Scripts SQL para o banco de dados
│   └── assets/               # Imagens e recursos estáticos
├── src/
│   ├── app/                  # Código fonte do Frontend (Angular)
│   │   ├── components/       # Componentes reutilizáveis (Header, Footer, etc.)
│   │   ├── guards/           # Guardas de rota (Auth, Admin)
│   │   ├── models/           # Interfaces e modelos de dados
│   │   ├── pages/            # Páginas da aplicação (Home, Login, Admin, etc.)
│   │   └── services/         # Serviços de comunicação com API
│   └── Back - End/
│       └── Autenticador.../  # Microsserviço de Autenticação Google
├── angular.json              # Configuração do Angular
├── package.json              # Dependências do projeto principal
└── README.md                 # Documentação do projeto
```

---

## ❓ Troubleshooting (Solução de Problemas)

### Erro de Conexão com Banco de Dados
*   **Sintoma**: A API mostra erro `ECONNREFUSED` ou falha ao conectar.
*   **Solução**: Verifique se o serviço MySQL está rodando e se as credenciais no arquivo `.env` da pasta `public/API` estão corretas.

### Erro de CORS
*   **Sintoma**: O navegador bloqueia requisições para a API.
*   **Solução**: Verifique se o pacote `cors` está configurado corretamente no `serve.js` e se a porta da API (2009) corresponde à chamada no Frontend (`src/app/services/user.service.ts`).

### Imagens não Carregam
*   **Sintoma**: Imagens de produtos aparecem quebradas.
*   **Solução**: Certifique-se de que a pasta `public/assets/uploads` existe. Se não existir, crie-a manualmente ou verifique as permissões de escrita do Node.js.

### Login com Google não Funciona
*   **Sintoma**: Redirecionamento falha ou retorna erro 400/401.
*   **Solução**: Verifique se as credenciais do Google Cloud (Client ID e Secret) estão válidas e se a URI de redirecionamento (`http://localhost:3000/auth/google/callback`) está autorizada no console do Google.

---

## 📝 Licença

Este projeto é desenvolvido para fins educacionais/avaliativos.


## Finalizado!
