'use server';

/**
 * @fileOverview AI-powered scouting report generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateScoutingReportInputSchema = z.object({
    playerName: z.string(),
    role: z.string(),
    stats: z.object({
        matchesPlayed: z.number().optional(),
        totalRuns: z.number().optional(),
        battingAverage: z.number().optional(),
        strikeRate: z.number().optional(),
        wicketsTaken: z.number().optional(),
        bowlingAverage: z.number().optional(),
        economyRate: z.number().optional(),
    }).optional(),
    skills: z.object({
        batting: z.number(),
        bowling: z.number(),
        fielding: z.number(),
        fitness: z.number(),
        mental: z.number(),
        leadership: z.number(),
    }),
    physicalAttributes: z.object({
        height: z.number().optional(),
        battingHand: z.string().optional(),
        bowlingStyle: z.string().optional(),
    }).optional(),
});

export type GenerateScoutingReportInput = z.infer<typeof GenerateScoutingReportInputSchema>;

// Output Schema
const GenerateScoutingReportOutputSchema = z.object({
    summary: z.string().describe('A comprehensive summary of the player\'s ability and style.'),
    strengths: z.array(z.string()).describe('List of key strengths.'),
    weaknesses: z.array(z.string()).describe('List of potential weaknesses or areas for improvement.'),
    potentialRating: z.number().describe('A score from 1-100 indicating future potential.'),
    comparison: z.string().describe('A comparison to a well-known international cricketer.'),
    careerProjection: z.object({
        projectedRuns: z.number().optional(),
        projectedWickets: z.number().optional(),
        peakAge: z.number(),
        summary: z.string().describe('A brief narrative on their career trajectory.'),
    }),
});

export type GenerateScoutingReportOutput = z.infer<typeof GenerateScoutingReportOutputSchema>;

export async function generateScoutingReportFlow(input: GenerateScoutingReportInput): Promise<GenerateScoutingReportOutput> {
    return flow(input);
}

const prompt = ai.definePrompt({
    name: 'generateScoutingReportPrompt',
    input: { schema: GenerateScoutingReportInputSchema },
    output: { schema: GenerateScoutingReportOutputSchema },
    prompt: `You are an expert cricket scout and talent evaluator. Analyze the following player data and generate a detailed scouting report.

Player: {{{playerName}}}
Role: {{{role}}}
Stats: {{json stats}}
Skills (0-20 scale): {{json skills}}
Physical: {{json physicalAttributes}}

Provide a realistic assessment. For potential rating, be critical but fair based on age (implied by career stage) and current skill levels.
For comparison, choose a player with a similar style, not necessarily same quality level.`,
});

const flow = ai.defineFlow(
    {
        name: 'generateScoutingReportFlow',
        inputSchema: GenerateScoutingReportInputSchema,
        outputSchema: GenerateScoutingReportOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
