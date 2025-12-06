import { render, screen } from '@testing-library/react';
import { PartnershipCard, PartnershipList } from '../PartnershipCard';
import { describe, it, expect } from 'vitest';

const mockPartnership = {
  batsman1Name: 'Player One',
  batsman2Name: 'Player Two',
  runs: 50,
  balls: 30,
  wicket: 1,
  strikeRate: 166.66,
};

describe('PartnershipCard', () => {
  it('renders partnership details correctly', () => {
    render(<PartnershipCard partnership={mockPartnership} />);
    
    expect(screen.getByText('Player One')).toBeInTheDocument();
    expect(screen.getByText('Player Two')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Runs
    expect(screen.getByText('30')).toBeInTheDocument(); // Balls
    expect(screen.getByText('166.7')).toBeInTheDocument(); // SR formatted
    expect(screen.getByText('For 1st wicket')).toBeInTheDocument();
  });

  it('shows "Current" badge when isCurrentPartnership is true', () => {
    render(<PartnershipCard partnership={mockPartnership} isCurrentPartnership={true} />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('formats ordinal suffix correctly', () => {
    const p2 = { ...mockPartnership, wicket: 2 };
    const { rerender } = render(<PartnershipCard partnership={p2} />);
    expect(screen.getByText('For 2nd wicket')).toBeInTheDocument();

    const p3 = { ...mockPartnership, wicket: 3 };
    rerender(<PartnershipCard partnership={p3} />);
    expect(screen.getByText('For 3rd wicket')).toBeInTheDocument();

    const p4 = { ...mockPartnership, wicket: 4 };
    rerender(<PartnershipCard partnership={p4} />);
    expect(screen.getByText('For 4th wicket')).toBeInTheDocument();
  });
});

describe('PartnershipList', () => {
  it('renders multiple partnerships', () => {
    const partnerships = [
      { ...mockPartnership, wicket: 1, runs: 10 },
      { ...mockPartnership, wicket: 2, runs: 20 },
    ];
    
    render(<PartnershipList partnerships={partnerships} />);
    
    expect(screen.getByText('For 1st wicket')).toBeInTheDocument();
    expect(screen.getByText('For 2nd wicket')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
