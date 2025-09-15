
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';

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

  React.useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const userSession = await res.json();
          setUser(userSession);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = async (username: string, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const authenticatedUser = await res.json();
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
    setUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed", error);
    }
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
