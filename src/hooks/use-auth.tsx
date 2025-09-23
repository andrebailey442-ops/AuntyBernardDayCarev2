
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { authenticateUser, isFirstRun, addUser } from '@/services/users';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isFirstRun: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<User | null>;
  logout: () => void;
  createAdmin: (emailOrUsername: string, password?: string) => Promise<User | null>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [firstRun, setFirstRun] = React.useState(false);
  const AUTH_STORAGE_KEY = 'currentUser';
  const router = useRouter();

  React.useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const isFirst = await isFirstRun();
      setFirstRun(isFirst);
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

  const createAdmin = async (emailOrUsername: string, password?: string) => {
    setLoading(true);
    try {
        const newUser = await addUser(emailOrUsername, 'Admin', password, undefined, emailOrUsername);
        setFirstRun(false); // Mark first run as complete
        // Log the new admin in
        const loggedInUser = await login(emailOrUsername, password);
        return loggedInUser;
    } catch(error) {
        console.error("Admin creation failed", error);
        return null;
    } finally {
        setLoading(false);
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = { user, loading, login, logout, isFirstRun: firstRun, createAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
