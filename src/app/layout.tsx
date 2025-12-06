import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Providers from '@/components/layout/Providers';
import { PermissionViewProvider } from '@/contexts/PermissionViewContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SCRBRD Beta - Cricket Management',
  description: 'Manage cricket teams, players, matches, and more with SCRBRD Beta.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <PermissionViewProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <AppShell>
                  {children}
                </AppShell>
              </ThemeProvider>
            </PermissionViewProvider>
          </AuthProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
