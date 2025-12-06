import { render, screen } from '@testing-library/react';
import { WinLossGauge } from '../WinLossGauge';
import { describe, it, expect } from 'vitest';

describe('WinLossGauge', () => {
  it('renders correctly with given stats', () => {
    render(<WinLossGauge wins={10} losses={5} draws={5} />);
    
    // Total games = 20. Wins = 10. Win Rate = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText('Win Rate')).toHaveLength(2);
    
    // Check stats breakdown
    expect(screen.getByText('10')).toBeInTheDocument(); // Wins
    expect(screen.getAllByText('5')).toHaveLength(2);  // Losses and Draws (both 5)
  });

  it('calculates win percentage correctly', () => {
    render(<WinLossGauge wins={3} losses={1} draws={0} />);
    // Total = 4. Wins = 3. Rate = 75%
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('handles zero total games gracefully', () => {
    render(<WinLossGauge wins={0} losses={0} draws={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders correct size classes', () => {
    const { container } = render(<WinLossGauge wins={5} losses={5} size="lg" />);
    // Check if the font size class for lg is present
    expect(container.querySelector('.text-4xl')).toBeInTheDocument();
  });
});
