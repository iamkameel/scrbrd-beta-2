"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();
  const currentPage = navLinks.find(link => link.href === pathname || (pathname.startsWith(link.href) && link.href !== '/'));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
       {!isMobile && ( /* Desktop trigger only visible if sidebar can be icon-only */
         <div className="hidden group-data-[collapsible=icon]/sidebar-wrapper:block">
            <SidebarTrigger />
         </div>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage?.label || "Dashboard"}
        </h1>
      </div>
      {/* Placeholder for User Profile Dropdown or other actions */}
      {/* <UserNav /> */}
    </header>
  );
}
