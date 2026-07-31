# HeartGeek - Aplicativo de Namoro

Este documento detalha o projeto HeartGeek, um aplicativo de namoro completo para o público geek, nerd, fãs de animes, videogames, quadrinhos e tecnologia.

## 💡 Sobre o Projeto

HeartGeek é um aplicativo de namoro de nicho que conecta pessoas com interesses em comum no universo geek. Ele oferece funcionalidades essenciais como autenticação de usuários, navegação por perfis com sistema de "swipe", detecção de matches, chat em tempo real e gerenciamento de perfil, incluindo upload de imagem e notificações push.

## 💻 Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Multer (para upload de arquivos), `ws` (para WebSockets), `expo-server-sdk` (para notificações push).
- **Frontend:** React Native (com Expo), TypeScript, `react-navigation` (Stack, Bottom Tabs), `react-native-deck-swiper`, `expo-image-picker`, `expo-notifications`, `@react-native-async-storage/async-storage`.
- **Banco de Dados:** PostgreSQL.
- **Controle de Versão:** Git.

## 🚀 Progresso Realizado

O projeto HeartGeek evoluiu de uma estrutura inicial para um MVP (Produto Mínimo Viável) robusto, com as seguintes funcionalidades implementadas:

- **Autenticação de Usuários:** Registro, login e logout com JWT.
- **Gerenciamento de Sessão:** Persistência de login via `AsyncStorage` no frontend.
- **Perfis de Usuários:**
  - Criação e atualização de perfis (nome, idade, biografia).
  - Upload de imagem de perfil com armazenamento local no servidor.
  - Visualização do próprio perfil.
- **Navegação por Perfis:** Interface de "swipe" (curtir/descurtir) com `react-native-deck-swiper`.
- **Matches:** Detecção de matches mútuos no backend.
- **Chat em Tempo Real:**
  - Servidor WebSocket para comunicação em tempo real.
  - Tela de chat para troca de mensagens entre usuários que deram match.
  - Histórico de mensagens.
- **Notificações Push:** Envio de notificações para novos matches e mensagens (via Expo).
- **Estrutura de Navegação:** `BottomTabNavigator` com telas de Home (swipe), Matches e Perfil.

## ▶️ Como Executar o Ambiente

Para configurar e executar o projeto HeartGeek, siga estes passos:

### 1. Configuração do Banco de Dados (PostgreSQL)

Certifique-se de ter o PostgreSQL em execução. Se estiver usando Docker, você pode iniciar o contêiner de banco de dados fornecido:

```bash
# Na raiz do projeto
docker-compose up -d db
```

### 2. Configuração do Backend

1.  **Navegue até a pasta do servidor:**
    ```bash
    cd server
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na pasta `server` com o seguinte conteúdo:
    ```
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/heartgeek?schema=public"
    JWT_SECRET="sua-chave-secreta-jwt-aqui"
    ```
    *Substitua `sua-chave-secreta-jwt-aqui` por uma string segura e aleatória.* Se o seu PostgreSQL não estiver em `localhost:5432` ou tiver outras credenciais, ajuste `DATABASE_URL`.

4.  **Aplique as migrações do Prisma:**
    ```bash
    npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma
    ```
    *Use `--accept-data-loss` apenas em ambiente de desenvolvimento, pois ele pode apagar dados existentes.* Se preferir criar migrações, use `npx prisma migrate dev --name <nome_da_migracao> --schema=./prisma/schema.prisma`.

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3000` e o servidor WebSocket estará ativo na mesma porta.

### 3. Configuração do Frontend

1.  **Navegue até a pasta do cliente:**
    ```bash
    cd client
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o aplicativo Expo:**
    ```bash
    npm start
    ```
    Isso abrirá o Metro Bundler. Você pode então executar o aplicativo em um emulador/simulador ou no seu dispositivo físico usando o aplicativo Expo Go.

    **Importante:** No código do frontend (em arquivos como `LoginScreen.js`, `RegisterScreen.js`, `HomeScreen.js`, `ChatScreen.js`, `ProfileScreen.js`, `EditProfileScreen.js` e `App.js`), você precisará **substituir todas as ocorrências de `SEU_IP_AQUI` pelo endereço IP da sua máquina** para que o aplicativo possa se comunicar com o backend. Por exemplo, se o IP da sua máquina for `192.168.1.100`, a URL se tornaria `http://192.168.1.100:3000`.

## 🎯 Próximos Passos (Sugestões para Desenvolvimento Futuro)

Com um MVP completo, as próximas etapas podem focar em refinamento e expansão:

-   **Melhorias de UI/UX:** Polimento visual, animações mais fluidas e transições.
-   **Recursos de Chat Avançados:** Indicadores de digitação, recibos de leitura, envio de mídias.
-   **Gerenciamento de Imagens:** Implementar um serviço de armazenamento de imagens mais robusto (e.g., AWS S3, Cloudinary) para produção.
-   **Testes:** Adicionar testes unitários e de integração para garantir a estabilidade.
-   **Deployment:** Preparar o aplicativo para produção e publicação nas lojas de aplicativos.
