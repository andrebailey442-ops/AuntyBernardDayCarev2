

'use client';

import * as React from 'react';
import { getLogoUrl, setLogoUrl as saveLogoUrl, clearLogoUrl as removeLogoUrl } from '@/services/students';


type LogoContextType = {
  logoUrl: string | null;
  setLogoUrl: (url: string) => void;
  clearLogo: () => void;
};

const LogoContext = React.createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrlState] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLogo = async () => {
        try {
            const storedLogo = await getLogoUrl();
            if (storedLogo) {
                setLogoUrlState(storedLogo);
            }
        } catch (error) {
            console.error("Failed to retrieve logo from database", error);
        } finally {
            setLoading(false);
        }
    };
    fetchLogo();
  }, []);

  const setLogoUrl = async (url: string) => {
    await saveLogoUrl(url);
    setLogoUrlState(url);
  };

  const clearLogo = async () => {
    await removeLogoUrl();
    setLogoUrlState(null);
  };

  const value = { logoUrl, setLogoUrl, clearLogo };

  // Prevent rendering children until the logo has been loaded from storage
  // to avoid a flash of the default logo.
  if (loading) {
    return null;
  }

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
}

export function useLogo() {
  const context = React.useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}
