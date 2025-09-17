
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { LogoProvider } from '@/hooks/use-logo';
import { initializeData } from '@/services/initialize';

export const metadata: Metadata = {
  title: 'Aunty Bernard DayCare and Pre-school',
  description: 'Preschool Admin Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  initializeData();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-sans antialiased')} suppressHydrationWarning>
        <AuthProvider>
          <LogoProvider>
            {children}
            <Toaster />
          </LogoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
