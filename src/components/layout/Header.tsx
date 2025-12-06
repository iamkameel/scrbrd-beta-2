
"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Users, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";
import { usePermissionView, SIMULATED_ROLES, SimulatedRole } from '@/contexts/PermissionViewContext';
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ROLE_GROUPS } from '@/lib/roles';

export function Header() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();
  const currentPage = navLinks.find(link => link.href === pathname || (pathname.startsWith(link.href) && link.href !== '/'));
  const { currentRole, setCurrentRole } = usePermissionView();
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading, userRole, availableRoles } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
       {!isMobile && (
         <div className="hidden group-data-[collapsible=icon]/sidebar-wrapper:block">
            <SidebarTrigger />
         </div>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage?.label || "Dashboard"}
        </h1>
      </div>
      
      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              {user.displayName || user.email?.split('@')[0]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
          Login
        </Button>
      )}

      {/* Role Switcher - Visible to System Architect OR Users with multiple roles */}
      {(userRole === 'System Architect' || (availableRoles && availableRoles.length > 1)) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              View: {currentRole}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Simulate User Role</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value as SimulatedRole)}>
              {Object.entries(ROLE_GROUPS).map(([group, roles]) => {
                // For System Architect, show all roles
                // For others, filter to only show available roles
                const visibleRoles = userRole === 'System Architect' 
                  ? roles 
                  : roles.filter(role => availableRoles.includes(role));
                
                if (visibleRoles.length === 0) return null;

                return (
                  <div key={group}>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground mt-2">{group}</DropdownMenuLabel>
                    {visibleRoles.map(role => (
                      <DropdownMenuRadioItem key={role} value={role}>{role}</DropdownMenuRadioItem>
                    ))}
                  </div>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
