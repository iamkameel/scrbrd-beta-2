'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { NavGroup } from '@/lib/nav-links';

interface CollapsibleNavGroupProps {
  group: NavGroup;
}

export default function CollapsibleNavGroup({ group }: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);
  const pathname = usePathname();
  const GroupIcon = group.icon;

  // Check if any link in this group is active
  const hasActiveLink = group.links.some(link => pathname === link.href);

  return (
    <div className="nav-group">
      {/* Group Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
          transition-all duration-200
          ${group.highlighted 
            ? 'bg-sidebar-primary/10 border border-sidebar-primary/20 hover:bg-sidebar-primary/20' 
            : 'hover:bg-sidebar-accent'}
          ${hasActiveLink && !isOpen ? 'bg-sidebar-accent/50' : ''}
          ${hasActiveLink ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'}
        `}
      >
        <div className="flex items-center gap-3">
          {GroupIcon && <GroupIcon size={20} />}
          <span className="font-medium text-sm">{group.label}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ?'rotate-180' : ''} opacity-70`}
        />
      </button>

      {/* Group Links */}
      <div
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className="flex flex-col gap-0.5 pl-2">
          {group.links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <li key={link.key}>
                <Link 
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-md
                    text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium border-l-2 border-sidebar-primary' 
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-2 border-transparent'}
                  `}
                >
                  {Icon && <Icon size={16} />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto text-xs bg-sidebar-primary/20 text-sidebar-primary px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
