
"use client";

import React, { useState } from 'react';
import { 
  navGroups, 
  dashboardLink, 
  type NavLink, 
  type NavGroup 
} from '@/lib/nav-links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissionView, type SimulatedRole } from '@/contexts/PermissionViewContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

import { USER_ROLES } from '@/lib/roles';

const rolePermissions = {
  // ADMINISTRATIVE
  [USER_ROLES.SYSTEM_ARCHITECT]: [
    "dashboard", "teams", "people", "suggest-role", "schools",
    "matches", "head-to-head", "umpire-review", "competitions", "divisions",
    "scouting", "awards",
    "session-planner", "drill-library", "player-development",
    "equipment", "fields", "transport", "financials", "sponsors",
    "user-management", "audit-log", "data-management", "user-roles", "rulebook", "strategic-calendar",
    "help-onboarding", "pitch-deck", "features"
  ],
  [USER_ROLES.ADMIN]: [
    "dashboard", "teams", "people", "suggest-role", "schools",
    "matches", "head-to-head", "umpire-review", "competitions", "divisions",
    "scouting", "awards",
    "session-planner", "drill-library", "player-development",
    "equipment", "fields", "transport", "financials", "sponsors",
    "user-management", "data-management", "rulebook", "strategic-calendar",
    "help-onboarding"
  ],
  [USER_ROLES.SPORTSMASTER]: [
    "dashboard", "teams", "people", "suggest-role", "schools",
    "matches", "head-to-head", "competitions", "divisions",
    "scouting", "awards",
    "session-planner", "drill-library", "player-development",
    "equipment", "fields", "transport",
    "rulebook", "strategic-calendar",
    "help-onboarding"
  ],
  [USER_ROLES.SCHOOL_ADMIN]: [
    "dashboard", "teams", "people", "schools", 
    "matches", "head-to-head", "awards", 
    "help-onboarding"
  ],

  // TEAM STAFF
  [USER_ROLES.COACH]: [
    "dashboard", "teams", "people", "suggest-role", 
    "matches", "head-to-head", "scouting",
    "session-planner", "drill-library", "player-development",
    "help-onboarding"
  ],
  [USER_ROLES.ASSISTANT_COACH]: [
    "dashboard", "teams", "people", 
    "matches", "head-to-head",
    "session-planner", "drill-library",
    "help-onboarding"
  ],
  [USER_ROLES.TEAM_MANAGER]: [
    "dashboard", "teams", "people", 
    "matches", "head-to-head",
    "transport", "equipment",
    "help-onboarding"
  ],
  [USER_ROLES.CAPTAIN]: [
    "dashboard", "teams", "people", 
    "matches", "head-to-head",
    "help-onboarding"
  ],

  // PLAYERS & SPECTATORS
  [USER_ROLES.PLAYER]: [
    "dashboard", "people", "teams", 
    "matches", "head-to-head", 
    "help-onboarding"
  ],
  [USER_ROLES.GUARDIAN]: [
    "dashboard", "people", "teams", 
    "matches", "head-to-head", 
    "help-onboarding"
  ],
  [USER_ROLES.SPECTATOR]: [
    "dashboard", "matches", "head-to-head", "schools", "teams", "pitch-deck"
  ],

  // SUPPORT & MEDICAL
  [USER_ROLES.TRAINER]: [
    "dashboard", "teams", "people",
    "session-planner", "drill-library",
    "help-onboarding"
  ],
  [USER_ROLES.PHYSIOTHERAPIST]: [
    "dashboard", "teams", "people",
    "help-onboarding"
  ],
  [USER_ROLES.DOCTOR]: [
    "dashboard", "teams", "people",
    "help-onboarding"
  ],
  [USER_ROLES.FIRST_AID]: [
    "dashboard", "teams", "people",
    "help-onboarding"
  ],

  // OFFICIALS & GROUND STAFF
  [USER_ROLES.UMPIRE]: [
    "dashboard", "matches", "umpire-review", "rulebook"
  ],
  [USER_ROLES.SCORER]: [
    "dashboard", "matches", "head-to-head", "live-scoring"
  ],
  [USER_ROLES.GROUNDS_KEEPER]: [
    "dashboard", "fields", "equipment"
  ],
  [USER_ROLES.DRIVER]: [
    "dashboard", "transport", "matches"
  ]
} satisfies Record<SimulatedRole, string[]>;

import { GlobalSearch } from '@/components/search/GlobalSearch';

const SidebarNav = () => {
  const pathname = usePathname();
  const { currentRole } = usePermissionView();
  const allowedKeys = rolePermissions[currentRole] || [];
  
  // Track which groups are open (use group ID as key)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Initialize with defaultOpen values and check if current path is in group
    const initial: Record<string, boolean> = {};
    navGroups.forEach(group => {
      const hasActivePath = group.links.some(link => pathname.startsWith(link.href));
      initial[group.id] = group.defaultOpen || hasActivePath;
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const isLinkAllowed = (key: string) => allowedKeys.includes(key);
  
  const isLinkActive = (href: string) => {
    if (href === '/home') return pathname === '/' || pathname === '/home';
    return pathname.startsWith(href);
  };

  const filterGroup = (group: NavGroup): NavGroup | null => {
    const filteredLinks = group.links.filter(link => isLinkAllowed(link.key));
    if (filteredLinks.length === 0) return null;
    return { ...group, links: filteredLinks };
  };

  const renderLink = (link: NavLink, isInGroup = false) => {
    const active = isLinkActive(link.href);
    const Component = isInGroup ? SidebarMenuSubButton : SidebarMenuButton;
    const Wrapper = isInGroup ? SidebarMenuSubItem : SidebarMenuItem;

    return (
      <Wrapper key={link.href}>
        <Component asChild isActive={active}>
          <Link
            href={link.disabled ? '#' : link.href}
            className={cn(
              link.disabled && 'opacity-50 cursor-not-allowed',
              !isInGroup && 'font-medium',
              'relative overflow-hidden rounded-md hover:bg-primary/5 transition-colors duration-200'
            )}
            aria-disabled={link.disabled}
            tabIndex={link.disabled ? -1 : undefined}
          >
            {active && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 bg-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              className="flex items-center w-full relative z-10"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {link.icon && React.createElement(link.icon as LucideIcon, { 
                className: isInGroup ? "size-3.5 mr-2" : "size-4 mr-2" 
              })}
              <span>{link.label}</span>
              {link.badge && (
                <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </motion.div>
          </Link>
        </Component>
      </Wrapper>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const filteredGroup = filterGroup(group);
    if (!filteredGroup) return null;

    const isOpen = openGroups[group.id];
    const hasActivePath = filteredGroup.links.some(link => isLinkActive(link.href));

    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "w-full font-semibold",
                hasActivePath && "text-primary"
              )}
            >
              {React.createElement(group.icon as LucideIcon, { className: "size-4" })}
              <span>{group.label}</span>
              <ChevronDown 
                className={cn(
                  "ml-auto size-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {filteredGroup.links.map(link => renderLink(link, true))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  // Filter dashboard link
  const showDashboard = isLinkAllowed(dashboardLink.key);

  return (
    <SidebarMenu>
      <SidebarMenuItem className="mb-4">
        <GlobalSearch />
      </SidebarMenuItem>

      {/* Dashboard - always at top, not in a group */}
      {showDashboard && renderLink(dashboardLink)}
      
      {showDashboard &&  <SidebarSeparator className="my-2" />}
      
      {/* Grouped navigation */}
      {navGroups.map(renderGroup)}
    </SidebarMenu>
  );
};

export default SidebarNav;
