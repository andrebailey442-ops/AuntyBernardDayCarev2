
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { authenticateUser, findUserByUsername, addUser } from '@/services/users';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const AUTH_STORAGE_KEY = 'currentUser';

  React.useEffect(() => {
    const initialize = async () => {
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

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(email, password);
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

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (googleUser && googleUser.email) {
        let appUser = await findUserByUsername(googleUser.email);

        if (!appUser) {
          // If user doesn't exist, create a new one
          const newUser = await addUser(
            googleUser.email,
            'Teacher', // Default role for new Google sign-ups
            undefined, // No password for Google users
            googleUser.photoURL || `https://picsum.photos/seed/${googleUser.uid}/100/100`,
            googleUser.displayName || googleUser.email
          );
          appUser = newUser;
        }
        
        setUser(appUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
        return appUser;
      }
      return null;
    } catch (error) {
      console.error("Google login failed", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    auth.signOut();
  };

  const value = { user, loading, login, loginWithGoogle, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
