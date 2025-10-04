# HeartGeek - Aplicativo de Namoro

Este documento resume o progresso e os próximos passos do projeto HeartGeek.

## 💡 Sobre o Projeto

HeartGeek é um aplicativo de namoro de nicho para o público geek, nerd, fãs de animes, video games, quadrinhos e tecnologia.

## 💻 Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React Native (com Expo), TypeScript
- **Banco de Dados:** PostgreSQL
- **Ambiente de Desenvolvimento:** Docker (recomendado para o banco de dados)

## 🚀 Estado Atual

A estrutura inicial do projeto foi criada e configurada:

1.  **Diretório Raiz (`/HeartGeek`):** Contém o projeto completo.
2.  **Backend (`/server`):**
    - Projeto Node.js inicializado com `npm`.
    - Dependências instaladas: `express`, `typescript`, `ts-node`, `nodemon`.
    - Um servidor Express básico foi criado em `src/index.ts`.
    - Um script `dev` foi adicionado ao `package.json` para iniciar o servidor em modo de desenvolvimento.
3.  **Frontend (`/client`):**
    - Projeto React Native com Expo inicializado.
    - Estrutura de um aplicativo "em branco" pronta para ser desenvolvida.

## ▶️ Como Executar o Ambiente

Para retomar o desenvolvimento, siga estes passos:

1.  **Inicie os Serviços:**
    - Certifique-se de que o **PostgreSQL** esteja em execução no seu sistema.
    - Se estiver usando Docker, inicie o contêiner do PostgreSQL.

2.  **Execute o Backend:**
    ```bash
    # Navegue até a pasta do servidor
    cd /home/danielbdof/HeartGeek/server

    # Instale as dependências (se for a primeira vez)
    npm install

    # Inicie o servidor de desenvolvimento
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3000`.

3.  **Execute o Frontend:**
    ```bash
    # Navegue até a pasta do cliente
    cd /home/danielbdof/HeartGeek/client

    # Instale as dependências (se for a primeira vez)
    npm install

    # Inicie o aplicativo (escolha uma das opções)
    npm run android
    npm run ios
    npm run web
    ```

## 🎯 Próximos Passos

O plano para continuar o desenvolvimento é:

1.  **Configurar o Prisma** no projeto do `server` para conectar com o banco de dados PostgreSQL.
2.  **Definir o Schema** do banco de dados, começando pelo modelo de `User` (usuário).
3.  **Criar os Endpoints da API** para o sistema de autenticação:
    - `POST /api/auth/register`
    - `POST /api/auth/login`
4.  **Construir as Telas** de Login e Cadastro no aplicativo React Native.
