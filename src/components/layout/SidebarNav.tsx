import React from 'react';
import { navLinks, bottomNavLinks } from '@/lib/nav-links';
import Link from 'next/link';
import {
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator,
} from "@/components/ui/sidebar";
import { LucideIcon } from 'lucide-react'; // Assuming LucideIcon is used for icons
import { NavLink } from '@/lib/nav-links'; // Import the NavLink type

const SidebarNav: React.FC = () => {
  return (
    <SidebarMenu>
      {navLinks.map((link: NavLink) => (
        link.separator ? (
          <SidebarSeparator key={link.href} />
        ) : (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild>
              <Link href={link.href}>{link.icon && (
                  // Render the icon if it exists
                  React.createElement(link.icon as LucideIcon, { className: "size-4" })
                )}

                {link.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      ))}

      {/* Add a separator before bottom navigation */}
      {bottomNavLinks.length > 0 && <SidebarSeparator />}

      {/* Render bottom navigation links */}
      {bottomNavLinks.map((link: NavLink) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton asChild>
            <Link href={link.href}>{link.icon && (
                // Render the icon if it exists, safely cast to LucideIcon
                React.createElement(link.icon as LucideIcon, { className: "size-4" })
              )}

              {link.label}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SidebarNav;