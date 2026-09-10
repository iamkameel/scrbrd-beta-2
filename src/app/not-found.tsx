'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: '#0b0f19',
      color: '#f8fafc',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>404 - Page Not Found</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>The requested resource or view could not be located on SCRBRD OS.</p>
      <Link href="/" style={{
        padding: '10px 20px',
        borderRadius: '9999px',
        background: '#38bdf8',
        color: '#000',
        fontWeight: 700,
        textDecoration: 'none'
      }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
