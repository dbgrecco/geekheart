export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  image?: string;
  interests?: string[];
  isOnline?: boolean;
  lastSeen?: string;
  pushToken?: string;
  compatibility?: number;
}

export interface Match {
  id: string;
  createdAt: string;
  user: User;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  matchId: string;
  isRead?: boolean;
  sender?: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
