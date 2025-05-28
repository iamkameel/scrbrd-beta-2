import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader as UiSidebarHeader,
  SidebarContent,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Header } from "@/components/layout/Header";
import { AppLogo } from "@/components/layout/AppLogo";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <SidebarProvider defaultOpen collapsible="icon"> {/* Sidebar open by default on desktop, icon mode when collapsed */}
          <div className="flex min-h-screen w-full">
            <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
              <UiSidebarHeader className="p-4 sticky top-0 bg-sidebar z-20 flex items-center justify-between h-16 border-b border-sidebar-border">
                <div className="group-data-[state=expanded]/sidebar-wrapper:block hidden">
                  <AppLogo />
                </div>
                <div className="group-data-[state=expanded]/sidebar-wrapper:hidden md:group-data-[state=collapsed]/sidebar-wrapper:block">
                  <AppLogo /> {/* Simplified or just icon when collapsed, handled by AppLogo or here */}
                </div>
              </UiSidebarHeader>
              <SidebarContent className="p-2 flex-1 overflow-y-auto">
                <SidebarNav />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <Header />
              <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
