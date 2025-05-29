
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { navLinks, bottomNavLinks, type NavLink } from '@/lib/nav-links';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname

const managementLinks = ['/teams', '/players', '/schools'];
const managementDropdownLinks = ['/scorer-profiles', '/umpire-profiles', '/groundskeeper-profiles', '/admin/user-management', '/field-directory']; // Added missing profiles

// Helper function to generate labels from hrefs
const generateLabelFromHref = (href: string) => {
  return href.substring(1).replace(/-/g, ' ').split('/').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper function to check if a link or its sub-links are active
const isLinkActive = (link: NavLink, pathname: string) => {
  if (link.href === '/') return pathname === '/'; // Exact match for home
  return pathname.startsWith(link.href) || (link.subLinks && link.subLinks.some(subLink => pathname.startsWith(subLink.href)));
};

const renderNavLinks = (links: NavLink[], pathname: string, isCollapsed: boolean) => {
  return links.map((link: NavLink) => {
    if (link.separator) {
      return <SidebarSeparator key={link.label || `separator-${Math.random()}`} className="my-2" />;
    }
    const isActive = isLinkActive(link, pathname);

    // Render tooltip for collapsed state
    if (isCollapsed) {
      return (
        <Tooltip key={link.href || link.label}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              className={cn("justify-center", link.disabled && "opacity-50 cursor-not-allowed")}
              disabled={link.disabled}
              isActive={isActive}
            >
              {link.icon && <link.icon className={cn("h-5 w-5")} />}
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {link.label}
            {link.disabled && <span className="text-xs text-muted-foreground ml-1">(Soon)</span>}
          </TooltipContent>
        </Tooltip>
      );
    } else {
      // Render as Link component wrapped around SidebarMenuButton for expanded state
      return (
        <div key={link.href || link.label}>
          <Link href={link.disabled ? "#" : link.href} passHref legacyBehavior>
            <SidebarMenuButton
              className={cn(
                "w-full justify-start",
                link.disabled && "opacity-50 cursor-not-allowed",
                isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" : ""
              )}
              disabled={link.disabled}
              asChild
              isActive={isActive}
            >
              <a>
                {link.icon && <link.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />}
                <span className="ml-3">{link.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </div>
      );
    }
  });
};

export function SidebarNav() {
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';

  const mainNavLinks = navLinks.filter(
    (link) =>
      !managementLinks.includes(link.href) &&
      !managementDropdownLinks.includes(link.href) &&
      !link.separator
  );

  const managementItemsWithIcons: NavLink[] = navLinks.filter(
    (link) => managementLinks.includes(link.href) || managementDropdownLinks.includes(link.href)
  );

  const isManagementActive = managementItemsWithIcons.some((item) => isLinkActive(item, pathname));

  return (
    <div className="flex flex-col h-full text-sidebar-foreground w-full">
      <SidebarMenu className="flex-1">
        {/* Render main navigation links excluding management links */}
        {renderNavLinks(mainNavLinks, pathname, isCollapsed)}

        <SidebarSeparator className="my-2" />

        {/* Render Management Tools group */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isManagementActive && "text-sidebar-primary font-semibold")}>
             Management Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {managementItemsWithIcons.map((link: NavLink, index: number) => {
               const navElement = renderNavLinks([link], pathname, isCollapsed)[0];
               return <React.Fragment key={link.href || `mgmt-link-${index}`}>{navElement}</React.Fragment>;
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 w-full" />
        <SidebarMenu className="mt-auto">
          {renderNavLinks(bottomNavLinks, pathname, isCollapsed)}
        </SidebarMenu>
      </SidebarMenu>
    </div>
  );
}
