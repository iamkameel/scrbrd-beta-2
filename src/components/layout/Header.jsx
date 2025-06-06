"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Users } from "lucide-react"; // Added Users icon
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";
import { usePermissionView, SIMULATED_ROLES } from '@/contexts/PermissionViewContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function Header() {
    const { toggleSidebar, isMobile } = useSidebar();
    const pathname = usePathname();
    const currentPage = navLinks.find(link => link.href === pathname || (pathname.startsWith(link.href) && link.href !== '/'));
    const { currentRole, setCurrentRole } = usePermissionView();
    return (<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {isMobile && (<Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-6 w-6"/>
          <span className="sr-only">Toggle Sidebar</span>
        </Button>)}
       {!isMobile && (<div className="hidden group-data-[collapsible=icon]/sidebar-wrapper:block">
            <SidebarTrigger />
         </div>)}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage?.label || "Dashboard"}
        </h1>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4"/>
            View: {currentRole}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Simulate User Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value)}>
            {SIMULATED_ROLES.map(role => (<DropdownMenuRadioItem key={role} value={role}>
                {role}
              </DropdownMenuRadioItem>))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Placeholder for User Profile Dropdown or other actions */}
      {/* <UserNav /> */}
    </header>);
}
