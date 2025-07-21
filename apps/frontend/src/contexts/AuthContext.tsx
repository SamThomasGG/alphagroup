import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.auth
        .me()
        .then(setUser)
        .catch(() => {
          // Token might be expired, clear it
          setAuthToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await api.auth.login(email, password);
      setAuthToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to the server. Please check your internet connection.'
        );
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await api.auth.register(email, password);
      setAuthToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to the server. Please check your internet connection.'
        );
      }
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
