
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { authenticateUser } from '@/services/users';
import { initializeData } from '@/services/initialize';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const AUTH_STORAGE_KEY = 'currentUser';

  React.useEffect(() => {
    const initialize = async () => {
      // Check if data is initialized in Firestore, if not, do it.
      await initializeData();
      try {
        const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to retrieve user from sessionStorage", error);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const login = async (username: string, password?: string) => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(username, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
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
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
