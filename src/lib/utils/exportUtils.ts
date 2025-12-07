/**
 * Export Utilities for SCRBRD
 * Handles CSV, PDF, and Excel exports
 */

export interface ExportColumn {
    key: string;
    label: string;
    format?: (value: any) => string;
}

/**
 * Convert data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn[],
    filename: string
): void {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create CSV header
    const headers = columns.map(col => col.label).join(',');

    // Create CSV rows
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];
            const formatted = col.format ? col.format(value) : value;

            // Escape commas and quotes
            const escaped = String(formatted ?? '')
                .replace(/"/g, '""');

            // Wrap in quotes if contains comma, newline, or quote
            return /[,\n"]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(',');
    }).join('\n');

    const csv = `${headers}\n${rows}`;

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export analytics data to CSV
 */
export function exportAnalyticsToCSV(
    data: any,
    reportType: 'overview' | 'performers' | 'detailed'
): void {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (reportType) {
        case 'overview':
            exportToCSV(
                [
                    { metric: 'Total Matches', value: data.totalMatches },
                    { metric: 'Total Runs', value: data.totalRuns },
                    { metric: 'Total Wickets', value: data.totalWickets },
                ],
                [
                    { key: 'metric', label: 'Metric' },
                    { key: 'value', label: 'Value' },
                ],
                `analytics-overview-${timestamp}`
            );
            break;

        case 'performers':
            const allPerformers = [
                ...data.topRunScorers.map((p: any) => ({ ...p, category: 'Top Run Scorer' })),
                ...data.topWicketTakers.map((p: any) => ({ ...p, category: 'Top Wicket Taker' })),
                ...data.bestBattingAverages.map((p: any) => ({ ...p, category: 'Best Batting Average' })),
                ...data.bestBowlingEconomy.map((p: any) => ({ ...p, category: 'Best Bowling Economy' })),
                ...data.mostCatches.map((p: any) => ({ ...p, category: 'Most Catches' })),
            ];

            exportToCSV(
                allPerformers,
                [
                    { key: 'category', label: 'Category' },
                    { key: 'name', label: 'Player Name' },
                    { key: 'value', label: 'Value' },
                    { key: 'stat', label: 'Stat Type' },
                ],
                `top-performers-${timestamp}`
            );
            break;

        case 'detailed':
            // Export all data in a comprehensive format
            exportToCSV(
                data.topRunScorers,
                [
                    { key: 'name', label: 'Player' },
                    { key: 'value', label: 'Runs' },
                ],
                `detailed-analytics-${timestamp}`
            );
            break;
    }
}

/**
 * Copy stats to clipboard for sharing
 */
export function copyStatsToClipboard(data: any, format: 'text' | 'markdown' = 'text'): void {
    let content = '';

    if (format === 'markdown') {
        content = `# Cricket Analytics Report\n\n`;
        content += `**Generated**: ${new Date().toLocaleDateString()}\n\n`;
        content += `## Overview\n`;
        content += `- Total Matches: ${data.totalMatches}\n`;
        content += `- Total Runs: ${data.totalRuns}\n`;
        content += `- Total Wickets: ${data.totalWickets}\n\n`;

        if (data.topRunScorers?.length > 0) {
            content += `## Top Run Scorers\n`;
            data.topRunScorers.forEach((p: any, i: number) => {
                content += `${i + 1}. ${p.name} - ${p.value} runs\n`;
            });
            content += `\n`;
        }

        if (data.topWicketTakers?.length > 0) {
            content += `## Top Wicket Takers\n`;
            data.topWicketTakers.forEach((p: any, i: number) => {
                content += `${i + 1}. ${p.name} - ${p.value} wickets\n`;
            });
        }
    } else {
        content = `Cricket Analytics Report - ${new Date().toLocaleDateString()}\n\n`;
        content += `Total Matches: ${data.totalMatches}\n`;
        content += `Total Runs: ${data.totalRuns}\n`;
        content += `Total Wickets: ${data.totalWickets}\n\n`;

        if (data.topRunScorers?.length > 0) {
            content += `Top Run Scorers:\n`;
            data.topRunScorers.forEach((p: any, i: number) => {
                content += `${i + 1}. ${p.name} - ${p.value} runs\n`;
            });
        }
    }

    navigator.clipboard.writeText(content).then(() => {
        // Success feedback handled by caller
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
    });
}

/**
 * Export match report to printable HTML
 */
export function generatePrintableMatchReport(matchData: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Match Report - ${matchData.homeTeam} vs ${matchData.awayTeam}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .match-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .match-info {
      color: #666;
      font-size: 14px;
    }
    .scorecard {
      margin: 30px 0;
    }
    .scorecard h2 {
      background: #f5f5f5;
      padding: 10px;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    .total-row {
      font-weight: bold;
      background: #f9f9f9;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="match-title">${matchData.homeTeam} vs ${matchData.awayTeam}</div>
    <div class="match-info">
      ${matchData.venue} | ${matchData.date} | ${matchData.format}
    </div>
  </div>

  <div class="scorecard">
    <h2>Match Summary</h2>
    <p><strong>Result:</strong> ${matchData.result || 'Match in progress'}</p>
    <p><strong>Player of the Match:</strong> ${matchData.playerOfMatch || 'TBD'}</p>
  </div>

  <div class="scorecard">
    <h2>Batting Scorecard</h2>
    <table>
      <thead>
        <tr>
          <th>Batsman</th>
          <th>Runs</th>
          <th>Balls</th>
          <th>4s</th>
          <th>6s</th>
          <th>SR</th>
        </tr>
      </thead>
      <tbody>
        ${matchData.batsmen?.map((b: any) => `
          <tr>
            <td>${b.name}</td>
            <td>${b.runs}</td>
            <td>${b.balls}</td>
            <td>${b.fours}</td>
            <td>${b.sixes}</td>
            <td>${b.strikeRate}</td>
          </tr>
        `).join('') || '<tr><td colspan="6">No data available</td></tr>'}
        <tr class="total-row">
          <td>Total</td>
          <td>${matchData.totalRuns || 0}</td>
          <td>${matchData.totalBalls || 0}</td>
          <td colspan="3">${matchData.totalWickets || 0} wickets</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="scorecard">
    <h2>Bowling Figures</h2>
    <table>
      <thead>
        <tr>
          <th>Bowler</th>
          <th>Overs</th>
          <th>Runs</th>
          <th>Wickets</th>
          <th>Economy</th>
        </tr>
      </thead>
      <tbody>
        ${matchData.bowlers?.map((b: any) => `
          <tr>
            <td>${b.name}</td>
            <td>${b.overs}</td>
            <td>${b.runs}</td>
            <td>${b.wickets}</td>
            <td>${b.economy}</td>
          </tr>
        `).join('') || '<tr><td colspan="5">No data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by SCRBRD | ${new Date().toLocaleString()}
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
      Print Report
    </button>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Open printable match report in new window
 */
export function printMatchReport(matchData: any): void {
    const html = generatePrintableMatchReport(matchData);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Please allow popups to print the report');
    }
}
