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
        min-h-screen 
        w-full
        bg-background 
        text-foreground
      `}>
        <AuthProvider>
          <ClientProviders>
            <ClientOnly>
              <div className="flex flex-col w-full min-h-0 flex-1">
                <main className="flex-1 w-full overflow-visible">
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
