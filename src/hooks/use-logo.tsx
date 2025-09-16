
'use client';

import * as React from 'react';

const LOGO_STORAGE_KEY = 'appCustomLogo';

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
    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoUrlState(storedLogo);
      }
    } catch (error) {
      console.error("Failed to retrieve logo from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setLogoUrl = (url: string) => {
    localStorage.setItem(LOGO_STORAGE_KEY, url);
    setLogoUrlState(url);
  };

  const clearLogo = () => {
    localStorage.removeItem(LOGO_STORAGE_KEY);
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
