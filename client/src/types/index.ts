export interface UserPhoto {
  id: string;
  url: string;
  order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  image?: string;
  photos?: UserPhoto[];
  interests?: string[];
  rpgClass?: string | null;
  favoriteGames?: string[];
  favoriteAnimes?: string[];
  favoriteConsoles?: string[];
  favoriteGeekCategories?: string[];
  isOnline?: boolean;
  lastSeen?: string;
  pushToken?: string;
  compatibility?: number;
  musicScore?: number;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  isTravelMode?: boolean;
  travelLocationName?: string | null;
  travelLatitude?: number | null;
  travelLongitude?: number | null;
  musicGenres?: string[];
  favoriteBands?: string[];
  spotifyUrl?: string | null;
  steamId?: string | null;
  instagramHandle?: string | null;
  twitterHandle?: string | null;
  tiktokHandle?: string | null;
  facebookUrl?: string | null;
  showSocials?: boolean;
  distanceKm?: number | null;
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
  imageUrl?: string | null;
  audioUrl?: string | null;
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
