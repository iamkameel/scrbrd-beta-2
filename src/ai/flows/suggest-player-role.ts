'use server';

/**
 * @fileOverview AI-powered player role suggestion flow.
 *
 * - suggestPlayerRole - A function that suggests a suitable playing role for a player.
 * - SuggestPlayerRoleInput - The input type for the suggestPlayerRole function.
 * - SuggestPlayerRoleOutput - The return type for the suggestPlayerRole function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPlayerRoleInputSchema = z.object({
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

const SuggestPlayerRoleOutputSchema = z.object({
  suggestedRole: z
    .string()
    .describe(
      'The AI-suggested playing role for the player, along with a brief explanation of why this role is suitable.'
    ),
});
export type SuggestPlayerRoleOutput = z.infer<typeof SuggestPlayerRoleOutputSchema>;

export async function suggestPlayerRole(input: SuggestPlayerRoleInput): Promise<SuggestPlayerRoleOutput> {
  return suggestPlayerRoleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPlayerRolePrompt',
  input: {schema: SuggestPlayerRoleInputSchema},
  output: {schema: SuggestPlayerRoleOutputSchema},
  prompt: `You are an expert cricket coach. Based on the provided player statistics and skills, suggest the most suitable playing role for the player.

Player Name: {{{playerName}}}
Player Statistics: {{{playerStatistics}}}
Player Skills: {{{playerSkills}}}

Suggest a suitable playing role and explain why this role is appropriate for the player.`,
});

const suggestPlayerRoleFlow = ai.defineFlow(
  {
    name: 'suggestPlayerRoleFlow',
    inputSchema: SuggestPlayerRoleInputSchema,
    outputSchema: SuggestPlayerRoleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
