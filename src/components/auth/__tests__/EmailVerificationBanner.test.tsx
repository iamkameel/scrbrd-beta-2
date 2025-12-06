import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmailVerificationBanner } from '../EmailVerificationBanner';
import { useAuth } from '@/contexts/AuthContext';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('EmailVerificationBanner', () => {
  it('should not render when user is null', () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
      sendVerificationEmail: vi.fn()
    });

    const { container } = render(<EmailVerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when email is verified', () => {
    (useAuth as Mock).mockReturnValue({
      user: { email: 'test@example.com', emailVerified: true },
      sendVerificationEmail: vi.fn()
    });

    const { container } = render(<EmailVerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when user exists but email not verified', () => {
    (useAuth as Mock).mockReturnValue({
      user: { email: 'test@example.com', emailVerified: false },
      sendVerificationEmail: vi.fn()
    });

    render(<EmailVerificationBanner />);
    expect(screen.getByText('Please verify your email address')).toBeInTheDocument();
  });

  it('should display user email in banner', () => {
    (useAuth as Mock).mockReturnValue({
      user: { email: 'test@example.com', emailVerified: false },
      sendVerificationEmail: vi.fn()
    });

    render(<EmailVerificationBanner />);
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it('should have a resend email button', () => {
    (useAuth as Mock).mockReturnValue({
      user: { email: 'test@example.com', emailVerified: false },
      sendVerificationEmail: vi.fn()
    });

    render(<EmailVerificationBanner />);
    expect(screen.getByText('Resend Email')).toBeInTheDocument();
  });
});
