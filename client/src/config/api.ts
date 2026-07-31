import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostIp = (): string => {
  // Tenta extrair o IP dinamicamente a partir das informações de desenvolvimento do Expo
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // Emulador Android usa 10.0.2.2 para acessar localhost da máquina host
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return '10.0.2.2';
  }

  return 'localhost';
};

const BASE_IP = getHostIp();
const PORT = '3000';

export const API_BASE_URL = `http://${BASE_IP}:${PORT}`;
export const WS_BASE_URL = `ws://${BASE_IP}:${PORT}`;

export const getImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}, token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro de comunicação com o servidor' }));
    throw new Error(errorData.message || `Erro HTTP ${response.status}`);
  }

  return response.json();
};
