import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'inactive' | 'default';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  let style = {};
  
  switch (variant) {
    case 'active':
      style = { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-primary)' };
      break;
    case 'inactive':
      style = { background: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-muted)' };
      break;
    default:
      style = { background: 'var(--color-bg-card-hover)', color: 'var(--color-text-main)' };
  }

  return (
    <span className="badge" style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      ...style
    }}>
      {children}
    </span>
  );
}
