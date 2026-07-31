# CHANGELOG

## 2026-07-31 - Versão Premium

### Added
- **Design System & UX Cyberpunk/Dark Neon:**
  - Identidade visual moderna com paleta escuro-obsidiana (`#0F0E17`), magenta neon (`#FF2A85`) e azul elétrico (`#00F0FF`).
  - Badges e chips interativos de Interesses Geek (*PC Gaming, Anime, Cosplay, D&D, Tech/Dev, Sci-Fi, HQs, etc.*).
  - Cálculo de porcentagem de compatibilidade `⚡ % Geek Match` no backend exibido dinamicamente em cada perfil.
  - Modal estilizado "É UM MATCH!" com comemoração visual e atalhos rápidos de navegação.

- **Comunicação em Tempo Real & Chat Enriquecido:**
  - Suporte no WebSocket Server para status de presença online/offline (`isOnline`, `lastSeen`).
  - Indicador de digitação em tempo real ("Fulano está digitando...").
  - Botões rápidos de quebra-gelo (*Icebreakers Geek*) para iniciar conversas na tela de chat.
  - Carrossel horizontal de "Novos Matches" com avatar glowing e indicador de presença.

- **Arquitetura & TypeScript:**
  - Migração completa do cliente React Native/Expo para **TypeScript** (`.tsx` / `.ts`).
  - Criação de `src/config/api.ts` com resolução de IP e gerenciador centralizado de rotas REST e WebSockets.
  - Atualização do schema Prisma com suporte a interesses (`interests`), status online (`isOnline`), confirmação de leitura (`isRead`).

---

## 2025-10-06

### Added
- **Backend:**
  - Implemented user authentication (registration, login).
  - Added `User` model with `name`, `email`, `password`, `age`, `bio`, `image`, and `pushToken` fields.
  - Implemented `Interaction` model to store likes/dislikes.
  - Implemented `Match` model to store mutual likes.
  - Implemented `Message` model to store chat messages.
  - Created `GET /api/me` endpoint to fetch current user's profile.
  - Created `PUT /api/me` endpoint to update current user's profile.
  - Created `POST /api/me/image` endpoint for profile image upload.
  - Created `GET /api/profiles` endpoint to fetch profiles for swiping.
  - Created `POST /api/interactions` endpoint to handle likes/dislikes and create matches.
  - Created `GET /api/matches` endpoint to fetch user's matches.
  - Created `GET /api/matches/:matchId/messages` endpoint to fetch chat history.
  - Implemented WebSocket server for real-time chat.
  - Implemented push notifications for new matches and messages (using Expo).
  - Configured static file serving for uploaded images.
  - Added authentication middleware for protected routes.

- **Frontend:**
  - Implemented user authentication flow (Login, Register screens).
  - Implemented `AuthContext` for global authentication state management and session persistence (AsyncStorage).
  - Implemented `HomeScreen` with a card-swiping interface for profiles (using `react-native-deck-swiper`).
  - Implemented `MatchesScreen` to display user's matches and navigate to chat.
  - Implemented `ChatScreen` for real-time messaging with WebSocket.
  - Implemented `ProfileScreen` to display user's own profile.
  - EditProfileScreen to update user's profile and upload profile image.
  - Implemented push notification registration and token submission to backend.
  - Configured `AppNavigator` with `BottomTabNavigator` for main app navigation (Home, Matches, Profile).
  - Added loading indicators for initial app load and data fetching.

### Changed
- Updated `README.md` to reflect project changes and instructions.

### Fixed
- Resolved Prisma migration issues in non-interactive environment.

