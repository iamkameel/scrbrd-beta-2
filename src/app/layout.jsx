import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarHeader as UiSidebarHeader, SidebarContent, SidebarInset, } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { AppLogo } from "@/components/layout/AppLogo";
import SidebarNav from "@/components/layout/SidebarNav";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Providers from '@/components/layout/Providers'; // Import the new Providers component
import { PermissionViewProvider } from '@/contexts/PermissionViewContext'; // Import the PermissionViewProvider
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});
export const metadata = {
    title: 'SCRBRD Beta - Cricket Management',
    description: 'Manage cricket teams, players, matches, and more with SCRBRD Beta.',
};
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <PermissionViewProvider> {/* Wrap with PermissionViewProvider */}
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <SidebarProvider defaultOpen>
                <div className="flex min-h-screen w-full">
                  <Sidebar className="border-r bg-sidebar text-sidebar-foreground" collapsible="icon">
                    <UiSidebarHeader className="p-4 sticky top-0 bg-sidebar z-20 flex items-center justify-between h-16 border-b border-sidebar-border">
                      <div className="group-data-[state=expanded]/sidebar-wrapper:block hidden">
                        <AppLogo />
                      </div>
                      <div className="group-data-[state=expanded]/sidebar-wrapper:hidden md:group-data-[state=collapsed]/sidebar-wrapper:block">
                        <AppLogo />
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
            </ThemeProvider>
          </PermissionViewProvider>
        </Providers>
        <Toaster />
      </body>
    </html>);
}
