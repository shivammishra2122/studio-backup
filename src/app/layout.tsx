'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/providers/client-providers';
import { AuthProvider } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Client-only component to avoid hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        antialiased 
        flex 
        flex-col 
        h-screen 
        bg-background 
        text-foreground 
        overflow-hidden
      `}>
        <AuthProvider>
          <ClientProviders>
            <ClientOnly>
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </ClientOnly>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
