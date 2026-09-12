
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Open_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Providers from '@/components/layout/Providers';
import { PermissionViewProvider } from '@/contexts/PermissionViewContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SCRBRD Beta",
  description: "KZN Schools cricket intelligence platform featuring broadcast live scoring, 360° wagon wheels, interactive scorecards, phase scoring dynamics, live match telemetry, and POPIA zero-trust RBAC governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${dmMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          <PermissionViewProvider>
            {children}
            <Toaster />
          </PermissionViewProvider>
        </Providers>
      </body>
    </html>
  );
}
