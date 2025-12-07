import { Ball, Person } from '@/types/firestore';

export interface CommentaryItem {
    over: number;
    ball: number;
    description: string;
    runs: number;
    timestamp: string;
    bowler?: string;
    batsman?: string;
}

export function generateCommentaryFromHistory(
    ballHistory: any[], // Using any[] as LiveScore definition uses any[] for ballHistory
    allPlayers: Person[]
): CommentaryItem[] {
    if (!ballHistory || ballHistory.length === 0) return [];

    const commentary: CommentaryItem[] = [];
    let currentOver = 0;
    let ballsInOver = 0;

    // We need to iterate and calculate overs/balls
    // Assuming ballHistory is ordered chronologically

    ballHistory.forEach((ball) => {
        // Determine if legal ball
        const isExtra = ball.extrasType === 'wide' || ball.extrasType === 'no-ball' || ball.extrasType === 'noball'; // Handle typo in type def

        if (!isExtra) {
            ballsInOver++;
        }

        // Get names
        const bowler = allPlayers.find(p => p.id === ball.bowlerId);
        const batsman = allPlayers.find(p => p.id === ball.batsmanId);
        const bowlerName = bowler ? bowler.lastName : "Bowler";
        const batsmanName = batsman ? batsman.lastName : "Batsman";

        // Generate description
        let description = "";
        const totalRuns = (ball.runs || 0) + (ball.extras || 0);

        if (ball.isWicket) {
            const wicketType = ball.wicketType || 'Dismissed';
            description = `WICKET! ${batsmanName} is out! ${wicketType}.`;
            if (ball.playerOutId && ball.playerOutId !== ball.batsmanId) {
                // Could be run out at non-striker end
                const playerOut = allPlayers.find(p => p.id === ball.playerOutId);
                description = `WICKET! ${playerOut?.lastName || 'Player'} is Run Out!`;
            }
        } else if (totalRuns >= 6) {
            description = `SIX! ${batsmanName} smashes ${bowlerName} over the rope!`;
        } else if (totalRuns >= 4) {
            description = `FOUR! ${batsmanName} finds the boundary off ${bowlerName}.`;
        } else if (totalRuns === 0) {
            description = `${bowlerName} to ${batsmanName}, no run.`;
        } else {
            description = `${bowlerName} to ${batsmanName}, ${totalRuns} run${totalRuns > 1 ? 's' : ''}.`;
        }

        if (ball.extrasType) {
            const extraName = ball.extrasType === 'noball' ? 'No Ball' :
                ball.extrasType.charAt(0).toUpperCase() + ball.extrasType.slice(1);
            description += ` (${extraName})`;
        }

        commentary.unshift({ // Add to front for reverse chronological order
            over: currentOver,
            ball: ballsInOver,
            description,
            runs: totalRuns,
            timestamp: ball.timestamp ? new Date(ball.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            bowler: bowlerName,
            batsman: batsmanName
        });

        // Increment over if 6 legal balls
        if (ballsInOver >= 6) {
            currentOver++;
            ballsInOver = 0;
        }
    });

    return commentary;
}
