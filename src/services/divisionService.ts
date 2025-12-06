export interface Division {
  id: string;
  name: string;
  leagueId: string;
  ageGroup: string;
}

const MOCK_DIVISIONS: Division[] = [
  { id: 'd1', name: 'Premier League A', leagueId: 'l1', ageGroup: 'Open' },
  { id: 'd2', name: 'Premier League B', leagueId: 'l1', ageGroup: 'Open' },
  { id: 'd3', name: 'U19 A', leagueId: 'l3', ageGroup: 'U19' }
];

export const getDivisions = async () => {
  return MOCK_DIVISIONS;
};

export const getDivisionById = async (id: string) => {
  return MOCK_DIVISIONS.find(d => d.id === id) || null;
};

export const getDivisionsByLeagueId = async (leagueId: string) => {
  return MOCK_DIVISIONS.filter(d => d.leagueId === leagueId);
};
