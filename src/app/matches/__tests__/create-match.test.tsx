import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchForm } from '@/components/matches/MatchForm';
import * as leagueActions from '@/app/actions/leagueActions';
import * as firestore from '@/lib/firestore';

// Mock dependencies
vi.mock('@/app/actions/leagueActions', () => ({
  getLeaguesAction: vi.fn()
}));

vi.mock('@/lib/firestore', () => ({
  fetchSeasons: vi.fn()
}));

// Mock UI components
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue, name }: any) => (
    <div data-testid={`select-${name}`}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <div data-value={value}>{children}</div>,
}));

// Mock useFormStatus
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

describe('Create Match Integration', () => {
  const mockCreateMatchAction = vi.fn();
  
  const mockTeams = [
    { id: 'team1', name: 'Team A' },
    { id: 'team2', name: 'Team B' }
  ];

  const mockFields = [
    { id: 'field1', name: 'Main Oval' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (leagueActions.getLeaguesAction as Mock).mockResolvedValue([]);
    (firestore.fetchSeasons as Mock).mockResolvedValue([]);
    mockCreateMatchAction.mockResolvedValue({ success: false, error: null });
  });

  it('renders the create match form correctly', () => {
    render(
      <MatchForm 
        mode="create"
        matchAction={mockCreateMatchAction}
        initialState={{}}
        teams={mockTeams as any}
        fields={mockFields as any}
      />
    );

    expect(screen.getByText('Schedule New Match')).toBeInTheDocument();
    expect(screen.getAllByText(/Home Team/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Away Team/i)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Match Date/i)).toBeInTheDocument();
  });

  it('allows entering match details', async () => {
    const user = userEvent.setup();
    render(
      <MatchForm 
        mode="create"
        matchAction={mockCreateMatchAction}
        initialState={{}}
        teams={mockTeams as any}
        fields={mockFields as any}
      />
    );

    const dateInput = screen.getByLabelText(/Match Date/i);
    await user.type(dateInput, '2024-01-01');
    expect(dateInput).toHaveValue('2024-01-01');
  });
});
