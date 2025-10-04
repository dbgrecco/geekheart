# HeartGeek - Aplicativo de Namoro

Este documento resume o progresso e os próximos passos do projeto HeartGeek.

## 💡 Sobre o Projeto

HeartGeek é um aplicativo de namoro de nicho para o público geek, nerd, fãs de animes, video games, quadrinhos e tecnologia.

## 💻 Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React Native (com Expo), TypeScript
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Controle de Versão:** Git

## 🚀 Progresso Realizado

- **[✔️] Backend Configurado:**
  - Conexão com o banco de dados PostgreSQL via Prisma.
  - Variáveis de ambiente (`.env`) configuradas para `DATABASE_URL` and `JWT_SECRET`.
  - Schema do `User` definido e migração do banco de dados executada.
  - Endpoints de autenticação (`/api/auth/register` e `/api/auth/login`) implementados.

- **[✔️] Frontend Estruturado:**
  - Estrutura de pastas criada (`src`, `screens`, `components`, `navigation`).
  - React Navigation instalado e configurado para gerenciar as telas.
  - Telas iniciais de `Login` e `Cadastro` criadas.
  - Formulário básico da tela de Login implementado.

- **[✔️] Controle de Versão:**
  - Repositório Git iniciado na raiz do projeto.
  - Todas as alterações iniciais foram salvas no primeiro commit.

## ▶️ Como Executar o Ambiente

Para retomar o desenvolvimento, siga estes passos:

1.  **Inicie os Serviços:**
    - Certifique-se de que o **PostgreSQL** esteja em execução no seu sistema.
    - Se estiver usando Docker, inicie o contêiner do PostgreSQL.

2.  **Execute o Backend:**
    ```bash
    # Navegue até a pasta do servidor
    cd server

    # Instale as dependências (se for a primeira vez)
    npm install

    # Inicie o servidor de desenvolvimento
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3000`.

3.  **Execute o Frontend:**
    ```bash
    # Navegue até a pasta do cliente
    cd client

    # Instale as dependências (se for a primeira vez)
    npm install

    # Inicie o aplicativo (escolha uma das opções)
    npm run android
    npm run ios
    npm run web
    ```

## 🎯 Próximos Passos

1.  **Construir o Formulário de Cadastro** na tela `RegisterScreen.js`.
2.  **Implementar a Lógica de Comunicação com a API** nas telas de Login e Cadastro para autenticar usuários.
3.  **Gerenciar o Estado de Autenticação** no aplicativo (salvar o token do usuário e navegar para a tela principal após o login).
4.  **Desenvolver a Tela Principal** do aplicativo (onde os "matches" acontecerão).