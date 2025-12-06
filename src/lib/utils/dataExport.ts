// Data export utility for matches and players

export function exportMatchesToCSV(matches: any[]): string {
  const headers = ['Date', 'Home Team', 'Away Team', 'Result', 'League', 'Season'];
  const rows = matches.map(m => [
    m.matchDate || '',
    m.homeTeamName || '',
    m.awayTeamName || '',
    m.result || '',
    m.leagueName || '',
    m.seasonName || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

export function exportPlayersToCSV(players: any[]): string {
  const headers = ['Name', 'Role', 'Batting Style', 'Bowling Style', 'Team'];
  const rows = players.map(p => [
    `${p.firstName} ${p.lastName}`,
    p.role || '',
    p.battingStyle || '',
    p.bowlingStyle || '',
    p.teamName || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
