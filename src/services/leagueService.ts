export interface League {
  id: string;
  name: string;
  countryId?: string;
  provinceId?: string;
  type?: string;
}

const MOCK_LEAGUES: League[] = [
  { id: 'l1', name: 'Premier League', type: 'T20', countryId: 'ZA' },
  { id: 'l2', name: 'First Division', type: '50 Over', countryId: 'ZA' },
  { id: 'l3', name: 'School League', type: 'T20', countryId: 'ZA' }
];

export const getLeagues = async () => {
  return MOCK_LEAGUES;
};

export const getLeagueById = async (id: string) => {
  return MOCK_LEAGUES.find(l => l.id === id) || null;
};
