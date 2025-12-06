// Live Commentary Generator Utility

export interface CommentaryContext {
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isDismissal?: boolean;
  dismissalType?: string;
  batsmanName?: string;
  bowlerName?: string;
  batsmanRuns?: number;
  bowlerWickets?: number;
  over?: number;
  ball?: number;
}

const boundaryCommentary = [
  "Magnificent shot! That's raced away to the boundary!",
  "FOUR! What a strike!",
  "Beautifully timed for four runs!",
  "Brilliant stroke! Finds the gap and it's four!",
  "Cracking shot! No chance for the fielders!",
  "Elegant! That's a textbook boundary!",
  "Smashed! That's gone to the fence!",
];

const sixCommentary = [
  "SIX! That's gone all the way!",
  "MAXIMUM! What a shot!",
  "Out of the ground! Huge six!",
  "Absolutely monstered! Six runs!",
  "Clean strike! That's sailed over the boundary!",
  "Massive hit! Six all the way!",
];

const dotBallCommentary = [
  "Dot ball. Good defensive shot.",
  "Well defended.",
  "Solid defense from the batsman.",
  "No run there.",
  "Watchful leave.",
  "Good bowling, no runs.",
];

const singleCommentary = [
  "Quick single taken.",
  "Good running between the wickets.",
  "One run added to the total.",
  "Nudged for a single.",
  "Sharp single stolen.",
];

const wicketCommentary = [
  "OUT! The bowler strikes!",
  "What a delivery! The batsman has to go!",
  "Breakthrough! That's a wicket!",
  "GONE! What a moment!",
  "Spectacular! The stumps are shattered!",
  "That's out! Incredible bowling!",
];

const wideCommentary = [
  "Wide! Down the leg side.",
  "That's a wide delivery.",
  "Wide called by the umpire.",
  "Extra run, that's wide.",
];

const noBallCommentary = [
  "No ball! Free hit coming up!",
  "That's a no ball - overstepped.",
  "No ball called!",
];

const milestoneTemplates = {
  fifty: [
    "FIFTY! Well played, {player}!",
    "Half-century for {player}! Brilliant innings!",
    "50 runs up for {player}! What a knock!",
    "That's {player}'s fifty! Superb batting!",
  ],
  hundred: [
    "CENTURY! What an innings by {player}!",
    "100 runs! {player} has reached a magnificent century!",
    "HUNDRED for {player}! Standing ovation!",
    "What a moment! {player} brings up the ton!",
  ],
  fiveWickets: [
    "FIVE WICKETS! {player} has a five-wicket haul!",
    "5-FOR! Incredible bowling by {player}!",
    "What a spell! {player} takes their fifth wicket!",
  ],
  hatTrick: [
    "HAT-TRICK! Unbelievable! {player} has done it!",
    "THREE IN THREE! {player} gets a hat-trick!",
    "HISTORY! {player} completes a hat-trick!",
  ],
};

function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateCommentary(context: CommentaryContext): string {
  // Check for milestones first
  if (context.batsmanRuns === 50 && context.batsmanName) {
    return getRandomTemplate(milestoneTemplates.fifty).replace('{player}', context.batsmanName);
  }
  
  if (context.batsmanRuns === 100 && context.batsmanName) {
    return getRandomTemplate(milestoneTemplates.hundred).replace('{player}', context.batsmanName);
  }
  
  if (context.bowlerWickets === 5 && context.bowlerName) {
    return getRandomTemplate(milestoneTemplates.fiveWickets).replace('{player}', context.bowlerName);
  }

  // Regular ball commentary
  if (context.isWide) {
    return getRandomTemplate(wideCommentary);
  }
  
  if (context.isNoBall) {
    return getRandomTemplate(noBallCommentary);
  }
  
  if (context.isDismissal) {
    let commentary = getRandomTemplate(wicketCommentary);
    if (context.bowlerName) {
      commentary += ` ${context.bowlerName} gets the breakthrough!`;
    }
    return commentary;
  }
  
  if (context.runs === 6) {
    return getRandomTemplate(sixCommentary);
  }
  
  if (context.runs === 4) {
    return getRandomTemplate(boundaryCommentary);
  }
  
  if (context.runs === 0) {
    return getRandomTemplate(dotBallCommentary);
  }
  
  if (context.runs === 1) {
    return getRandomTemplate(singleCommentary);
  }
  
  // Default for 2, 3, or other runs
  return `${context.runs} run${context.runs > 1 ? 's' : ''} added.`;
}

export function generateOverSummary(balls: number, runs: number, wickets: number): string {
  if (wickets > 0) {
    return `End of over: ${runs} run${runs !== 1 ? 's' : ''} and ${wickets} wicket${wickets !== 1 ? 's' : ''}`;
  }
  return `End of over: ${runs} run${runs !== 1 ? 's' : ''}`;
}
