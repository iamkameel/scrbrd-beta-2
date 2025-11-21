import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', style = {} }: CardProps) {
  return (
    <div className={`card ${className}`} style={{
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      transition: 'var(--transition-fast)',
      ...style
    }}>
      {children}
    </div>
  );
}
