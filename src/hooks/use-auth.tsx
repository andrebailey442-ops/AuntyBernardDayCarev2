

'use client';

import * as React from 'react';
import type { User, UserRole } from '@/lib/types';
import { authenticateUser, addUser, isFirstRun as checkFirstRun } from '@/services/users';
import { db } from '@/lib/firebase-client';
import { ref, onValue, off, set } from 'firebase/database';

const AUTH_SESSION_PATH = 'authSession';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isFirstRun: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<User | null>;
  logout: () => void;
  createAdmin: (email: string, password: string) => Promise<User | null>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isFirstRun, setIsFirstRun] = React.useState(false);
  
  React.useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const firstRun = await checkFirstRun();
      setIsFirstRun(firstRun);

      const sessionRef = ref(db, AUTH_SESSION_PATH);
      const listener = onValue(sessionRef, (snapshot) => {
        try {
          if (snapshot.exists()) {
            setUser(snapshot.val());
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to retrieve user session from Firebase", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });

      return () => off(sessionRef, 'value', listener);
    }

    const unsubscribe = initializeAuth();
    return () => {
        unsubscribe.then(fn => fn());
    }
  }, []);

  const login = async (emailOrUsername: string, password?: string): Promise<User | null> => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(emailOrUsername, password);
      if (authenticatedUser) {
        const { password: _, ...sessionUser } = authenticatedUser;
        await set(ref(db, AUTH_SESSION_PATH), sessionUser);
        setUser(sessionUser as User);
        return authenticatedUser;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      await set(ref(db, AUTH_SESSION_PATH), null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (email: string, password: string): Promise<User | null> => {
    if (!isFirstRun) {
        throw new Error("Admin account can only be created on the first run.");
    }
    setLoading(true);
    try {
        const adminUser = await addUser(email, 'Admin', password, undefined, 'Admin');
        setIsFirstRun(false); // Update state after admin creation
        return adminUser;
    } catch (error) {
        console.error("Admin creation failed", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    await set(ref(db, AUTH_SESSION_PATH), null);
    setUser(null);
  };

  const value = { user, loading, isFirstRun, login, logout, createAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
