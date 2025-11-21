'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, Shield, Dumbbell } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/players', label: 'Players', icon: Users },
    { href: '/matches', label: 'Matches', icon: Trophy },
    { href: '/teams', label: 'Teams', icon: Shield },
    { href: '/training', label: 'Training', icon: Dumbbell },
  ];

  return (
    <nav className="sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--color-bg-card)',
      borderRight: '1px solid var(--color-border)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 10
    }}>
      <div className="nav-brand" style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--color-primary)',
        marginBottom: '3rem',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>🏏</span> SCRBRD
      </div>
      
      <ul className="nav-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <li key={item.href}>
              <Link href={item.href} style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'var(--transition-fast)'
              }}>
                <Icon size={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
