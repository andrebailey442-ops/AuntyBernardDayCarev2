
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { authenticateUser } from '@/services/users';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const AUTH_STORAGE_KEY = 'currentUser';

  React.useEffect(() => {
    const initialize = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to retrieve user from localStorage", error);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    setLoading(true);
    try {
      const authenticatedUser = authenticateUser(emailOrUsername, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
        return authenticatedUser;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
