"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Navbar } from "@/components/layout/Navbar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Public pages should never have sidebar
  const publicPages = ['/', '/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Landing page or not logged in - show navbar only
  if (!user || isPublicPage) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Authenticated users on app pages - show responsive sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 lg:ml-[280px] transition-all duration-300">
          <Header />
          <EmailVerificationBanner />
          <div className="p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
