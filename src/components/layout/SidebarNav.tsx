"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navLinks, bottomNavLinks, type NavLink } from '@/lib/nav-links';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';


const renderNavLinks = (links: NavLink[], pathname: string, isCollapsed: boolean) => {
  return links.map((link, index) => {
    if (link.separator) {
      return <SidebarSeparator key={`sep-${index}`} className="my-2" />;
    }
    const isActive = pathname === link.href;
    const buttonContent = (
      <>
        <link.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
        <span className={cn(isCollapsed ? "sr-only" : "")}>{link.label}</span>
      </>
    );

    return (
      <SidebarMenuItem key={link.href} className={link.disabled ? "opacity-50 cursor-not-allowed" : ""}>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "justify-start",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                  !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                disabled={link.disabled}
              >
                <Link href={link.disabled ? "#" : link.href} aria-disabled={link.disabled} tabIndex={link.disabled ? -1 : undefined}>
                  {buttonContent}
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              {link.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className={cn(
              "justify-start",
              isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
              !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            disabled={link.disabled}
          >
            <Link href={link.disabled ? "#" : link.href} aria-disabled={link.disabled} tabIndex={link.disabled ? -1 : undefined}>
              {buttonContent}
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  });
};


export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu className="flex-1">
        {renderNavLinks(navLinks, pathname, isCollapsed)}
      </SidebarMenu>
      {bottomNavLinks.length > 0 && (
        <>
          <SidebarSeparator className="my-2" />
          <SidebarMenu className="mt-auto">
            {renderNavLinks(bottomNavLinks, pathname, isCollapsed)}
          </SidebarMenu>
        </>
      )}
    </div>
  );
}
