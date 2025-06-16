import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/providers/client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`
        ${geistSans.variable} 
        ${geistMono.variable} 
        antialiased 
        flex 
        flex-col 
        min-h-screen
        bg-background 
        text-foreground 
        overflow-x-hidden
      `}>
        <ClientProviders>
          <main className="flex-1 w-full min-h-screen">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}