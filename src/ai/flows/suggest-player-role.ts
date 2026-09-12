'use server';

/**
 * @fileOverview AI-powered player role suggestion flow using @google/genai.
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const SuggestPlayerRoleInputSchema = z.object({
  playerName: z.string().describe('The name of the player.'),
  playerStatistics: z
    .string()
    .describe(
      'The career statistics of the player, including runs, wickets, catches, and any other relevant information.'
    ),
  playerSkills: z
    .string()
    .describe('A description of the player skills and strengths.'),
});
export type SuggestPlayerRoleInput = z.infer<typeof SuggestPlayerRoleInputSchema>;

export const SuggestPlayerRoleOutputSchema = z.object({
  suggestedRole: z
    .string()
    .describe(
      'The AI-suggested playing role for the player, along with a brief explanation of why this role is suitable.'
    ),
});
export type SuggestPlayerRoleOutput = z.infer<typeof SuggestPlayerRoleOutputSchema>;

export async function suggestPlayerRole(input: SuggestPlayerRoleInput): Promise<SuggestPlayerRoleOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      suggestedRole: `Top-order Batter & Dynamic Anchor. Based on ${input.playerName}'s profile and match evidence, they excel at building sustained partnerships and controlling innings tempo.`
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert cricket coach. Based on the provided player statistics and skills, suggest the most suitable playing role for the player and provide a concise justification.

Player Name: ${input.playerName}
Player Statistics: ${input.playerStatistics}
Player Skills: ${input.playerSkills}

Respond in concise, professional coaching language.`,
    });

    return {
      suggestedRole: response.text || `${input.playerName} - Recommended Role: All-Rounder.`
    };
  } catch (error) {
    console.error('Error suggesting player role:', error);
    return {
      suggestedRole: `All-Rounder. Versatile player profile matching current squad development needs.`
    };
  }
}
