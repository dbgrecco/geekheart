import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (authData: { user: User; token: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedAuthState = await AsyncStorage.getItem('authState');
        if (savedAuthState) {
          setAuthState(JSON.parse(savedAuthState));
        }
      } catch (e) {
        console.error('Failed to load auth state.', e);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (authData: { user: User; token: string }) => {
    try {
      const newState = {
        user: authData.user,
        token: authData.token,
      };
      setAuthState(newState);
      await AsyncStorage.setItem('authState', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save auth state.', e);
    }
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    try {
      if (!authState.user) return;
      const updatedUser = { ...authState.user, ...updatedFields };
      const newState = { ...authState, user: updatedUser };
      setAuthState(newState);
      await AsyncStorage.setItem('authState', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to update auth state user.', e);
    }
  };

  const logout = async () => {
    try {
      setAuthState({ user: null, token: null });
      await AsyncStorage.removeItem('authState');
    } catch (e) {
      console.error('Failed to remove auth state.', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isLoggedIn: !!authState.user && !!authState.token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
