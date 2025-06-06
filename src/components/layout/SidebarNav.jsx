"use client"; // Add this directive
import React from 'react';
import { navLinks as allNavLinks, bottomNavLinks as allBottomNavLinks } from '@/lib/nav-links';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { usePermissionView } from '@/contexts/PermissionViewContext';
const rolePermissions = {
    "Super Admin": ["dashboard", "team-directory", "player-profiles", "school-profiles", "match-fixtures", "match-results", "live-scoring", "prematch-process", "awards", "suggest-player-role", "wagon-wheel", "scoring-zones", "spider-chart", "umpire-profiles", "groundskeeper-profiles", "field-directory", "user-management", "settings"],
    "School Admin": ["dashboard", "team-directory", "player-profiles", "school-profiles", "match-fixtures", "match-results", "awards", "suggest-player-role", "settings"],
    "Coach": ["dashboard", "team-directory", "player-profiles", "match-fixtures", "match-results", "suggest-player-role", "settings"],
    "Player": ["dashboard", "player-profiles", "team-directory", "match-fixtures", "match-results", "settings"],
    "Parent": ["dashboard", "player-profiles", "team-directory", "match-fixtures", "match-results", "settings"], // Assuming parent views their child's profile/team
    "Spectator": ["dashboard", "match-fixtures", "match-results", "school-profiles", "team-directory"],
    "Umpire": ["dashboard", "match-fixtures", "umpire-profiles", "settings"],
    "Scorer": ["dashboard", "match-fixtures", "live-scoring", "settings"], // Assuming scorers link is live-scoring for them
    "Groundskeeper": ["dashboard", "field-directory", "groundskeeper-profiles", "settings"],
};
const SidebarNav = () => {
    const { currentRole } = usePermissionView();
    const allowedKeys = rolePermissions[currentRole] || [];
    const filterLinks = (links) => {
        return links.filter(link => link.separator || (link.key && allowedKeys.includes(link.key)));
    };
    const visibleNavLinks = filterLinks(allNavLinks);
    const visibleBottomNavLinks = filterLinks(allBottomNavLinks);
    const renderLink = (link) => {
        if (link.separator) {
            return <SidebarSeparator key={link.href}/>;
        }
        return (<SidebarMenuItem key={link.href}>
        <SidebarMenuButton asChild isActive={false /* Add active state logic if needed */}>
          <Link href={link.disabled ? '#' : link.href} className={cn(link.disabled && 'opacity-50 cursor-not-allowed')} aria-disabled={link.disabled} tabIndex={link.disabled ? -1 : undefined}>
            {link.icon && React.createElement(link.icon, { className: "size-4" })}
            {link.label}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>);
    };
    return (<SidebarMenu>
      {visibleNavLinks.map(renderLink)}
      {visibleBottomNavLinks.length > 0 && <SidebarSeparator />}
      {visibleBottomNavLinks.map(renderLink)}
    </SidebarMenu>);
};
export default SidebarNav;
