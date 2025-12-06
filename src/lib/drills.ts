export type DrillCategory = 'Batting' | 'Bowling' | 'Fielding' | 'Fitness' | 'Wicketkeeping';
export type DrillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Drill = {
  drillId: string;
  title: string;
  category: DrillCategory;
  difficulty: DrillDifficulty;
  durationMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  equipment: string[];
  description: string;
  instructions: string[];
  coachingPoints: string[];
};

export const DRILLS: Drill[] = [
  {
    drillId: 'd1',
    title: 'Front Foot Drive Technique',
    category: 'Batting',
    difficulty: 'Beginner',
    durationMinutes: 20,
    minPlayers: 2,
    maxPlayers: 4,
    equipment: ['Bat', 'Cone', 'Tennis Balls/Soft Balls'],
    description: 'A fundamental drill to practice the mechanics of the front foot drive.',
    instructions: [
      'Place a ball on a cone or tee at a comfortable driving length.',
      'Batter steps forward with head over the ball.',
      'Execute the drive with a high elbow and full face of the bat.',
      'Hold the finish position for 3 seconds to check balance.'
    ],
    coachingPoints: [
      'Head leads the movement.',
      'Front knee bent.',
      'Bat swing in a straight line.',
      'Check balance at the end.'
    ]
  },
  {
    drillId: 'd2',
    title: 'Target Bowling',
    category: 'Bowling',
    difficulty: 'Intermediate',
    durationMinutes: 30,
    minPlayers: 1,
    maxPlayers: 6,
    equipment: ['Balls', 'Stumps', 'Cones/Markers'],
    description: 'Improves bowling accuracy by aiming for specific zones on the pitch.',
    instructions: [
      'Place a marker (coin or flat cone) on a good length spot.',
      'Bowlers run in and attempt to hit the marker.',
      'Score 1 point for hitting the zone, 3 points for hitting the marker.',
      'Rotate bowlers after every 6 balls.'
    ],
    coachingPoints: [
      'Focus on a consistent run-up.',
      'Keep eyes on the target.',
      'Maintain a strong front arm.',
      'Follow through completely.'
    ]
  },
  {
    drillId: 'd3',
    title: 'High Catching Circuit',
    category: 'Fielding',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    minPlayers: 4,
    maxPlayers: 12,
    equipment: ['Balls', 'Bat (for hitting skiers)'],
    description: 'Practice taking high catches under pressure and fatigue.',
    instructions: [
      'Coach hits high balls (skiers) to fielders stationed at the boundary.',
      'Fielders must call "Mine!" loud and clear.',
      'Catch the ball with soft hands and secure it.',
      'Throw the ball back to the keeper/coach accurately.'
    ],
    coachingPoints: [
      'Get under the ball early.',
      'Keep eyes on the ball until it hits the hands.',
      'Reverse cup technique for high balls.',
      'Stable base when catching.'
    ]
  },
  {
    drillId: 'd4',
    title: 'Running Between Wickets',
    category: 'Fitness',
    difficulty: 'Beginner',
    durationMinutes: 15,
    minPlayers: 2,
    maxPlayers: 20,
    equipment: ['Bats', 'Pads', 'Helmets', 'Stumps'],
    description: 'Improves speed, turning technique, and communication between batters.',
    instructions: [
      'Pairs of batters start at the crease.',
      'On the whistle, sprint 2 runs.',
      'Focus on the "Yes", "No", "Wait" calls.',
      'Practice sliding the bat properly when turning.'
    ],
    coachingPoints: [
      'Call loud and early.',
      'Run the first run hard.',
      'Turn efficiently by lowering the center of gravity.',
      'Slide the bat, don\'t just tap the line.'
    ]
  },
  {
    drillId: 'd5',
    title: 'Spin Bowling Variations',
    category: 'Bowling',
    difficulty: 'Advanced',
    durationMinutes: 40,
    minPlayers: 1,
    maxPlayers: 4,
    equipment: ['Balls', 'Nets'],
    description: 'Developing control over different spin variations (top spinner, arm ball, googly).',
    instructions: [
      'Bowler nominates the variation before bowling.',
      'Coach/Batter gives feedback on if they picked it.',
      'Focus on maintaining the same arm speed for all variations.'
    ],
    coachingPoints: [
      'Grip changes should be concealed.',
      'Use the wrist/fingers vigorously.',
      'Land the ball in the same spot despite the variation.'
    ]
  },
  {
    drillId: 'd6',
    title: 'Reaction Catching',
    category: 'Fielding',
    difficulty: 'Advanced',
    durationMinutes: 15,
    minPlayers: 2,
    maxPlayers: 6,
    equipment: ['Reaction Balls / Tennis Balls', 'Rebound Net (optional)'],
    description: 'Sharpens reflexes for close-in catching (slips, short leg).',
    instructions: [
      'Fielders stand close to a wall or rebound net.',
      'Throw the ball against the wall so it rebounds unpredictably.',
      'React and catch with one or two hands.',
      'Increase speed as confidence grows.'
    ],
    coachingPoints: [
      'Stay low with weight on balls of feet.',
      'Soft hands.',
      'Watch the ball off the wall/bat.'
    ]
  }
];
