'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navGroups, dashboardLink } from '@/lib/nav-links';
import CollapsibleNavGroup from './CollapsibleNavGroup';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const DashboardIcon = dashboardLink.icon;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`
          sidebar fixed h-screen z-40 transition-transform duration-300
          w-[280px] bg-sidebar border-r border-sidebar-border p-6 flex flex-col overflow-y-auto overflow-x-hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center shrink-0">
          <Image 
            src="/images/scrbrd-logo.png" 
            alt="SCRBRD" 
            width={200} 
            height={50}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
        
        {/* Navigation Content */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Dashboard Link (always visible) */}
          <Link 
            href={dashboardLink.href} 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-[0.95rem] font-medium transition-all duration-200
              ${pathname === dashboardLink.href 
                ? 'bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/30 font-semibold' 
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent'}
            `}
          >
            {DashboardIcon && <DashboardIcon size={20} />}
            {dashboardLink.label}
          </Link>

          {/* Spacer */}
          <div className="h-2" />

          {/* Collapsible Navigation Groups */}
          <div onClick={() => setIsMobileMenuOpen(false)} className="space-y-1">
            {navGroups.map((group) => (
              <CollapsibleNavGroup key={group.key} group={group} />
            ))}
          </div>
        </div>

        {/* Footer / Version Info */}
        <div className="mt-auto pt-4 border-t border-sidebar-border text-xs text-sidebar-foreground/30 text-center">
          <p>v2.0.0</p>
        </div>
      </nav>
    </>
  );
}
