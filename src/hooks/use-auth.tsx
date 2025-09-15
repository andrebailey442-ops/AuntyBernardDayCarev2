
'use client';

import * as React from 'react';
import type { SessionUser, User } from '@/lib/types';
import { authenticateUser, initializeLocalStorageData } from '@/services/users';

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<SessionUser | null>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const AUTH_STORAGE_KEY = 'currentUser';

  React.useEffect(() => {
    const initialize = async () => {
      await initializeLocalStorageData();
      try {
        // Instead of getting from localStorage, we will fetch from a server endpoint
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          if (session.user) {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error("Failed to retrieve user session", error);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const login = async (username: string, password?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { user: authenticatedUser } = await response.json();
        setUser(authenticatedUser);
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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
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
