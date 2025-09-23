
'use client';

import * as React from 'react';
import type { User, UserRole } from '@/lib/types';
import { authenticateUser, addUser, getUsers, isFirstRun as checkFirstRun, setFirstRunComplete } from '@/services/users';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<User | null>;
  logout: () => void;
  isFirstRun?: boolean;
  completeFirstRun: (username: string, email: string, password: string) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isFirstRun, setIsFirstRun] = React.useState<boolean | undefined>(undefined);
  const AUTH_STORAGE_KEY = 'currentUser';

  React.useEffect(() => {
    const initialize = async () => {
      try {
        const firstRun = await checkFirstRun();
        setIsFirstRun(firstRun);
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(emailOrUsername, password);
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
  
  const completeFirstRun = async (username: string, email: string, password: string) => {
    await addUser(email, 'Admin', password, undefined, username);
    await setFirstRunComplete();
    setIsFirstRun(false);
  }

  const value = { user, loading, login, logout, isFirstRun, completeFirstRun };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
