'use server';

/**
 * @fileOverview An AI agent for exploring hidden gems at a travel destination.
 *
 * - exploreHiddenGems - A function that suggests lesser-known and authentic experiences.
 * - ExploreHiddenGemsInput - The input type for the exploreHiddenGems function.
 * - ExploreHiddenGemsOutput - The return type for the exploreHiddenGems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExploreHiddenGemsInputSchema = z.object({
  destination: z.string().describe('The travel destination.'),
  interests: z.string().describe('The interests of the traveler.'),
});
export type ExploreHiddenGemsInput = z.infer<typeof ExploreHiddenGemsInputSchema>;

const ExploreHiddenGemsOutputSchema = z.object({
  gems: z.array(
    z.object({
      name: z.string().describe('The name of the hidden gem.'),
      description: z.string().describe('A description of the hidden gem.'),
      whyAuthentic: z
        .string()
        .describe('Why this experience is considered authentic.'),
    })
  ).describe('A list of hidden gems at the destination.'),
});
export type ExploreHiddenGemsOutput = z.infer<typeof ExploreHiddenGemsOutputSchema>;

export async function exploreHiddenGems(input: ExploreHiddenGemsInput): Promise<ExploreHiddenGemsOutput> {
  return exploreHiddenGemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exploreHiddenGemsPrompt',
  input: {schema: ExploreHiddenGemsInputSchema},
  output: {schema: ExploreHiddenGemsOutputSchema},
  prompt: `You are a travel expert specializing in finding hidden gems and authentic experiences for travelers.

  The traveler is going to {{{destination}}} and is interested in {{{interests}}}.

  Suggest some lesser-known and authentic experiences at the destination, making sure they align with the traveler's interests.

  Return the gems in the requested JSON format. For each gem, explain why it is considered authentic.
  `,
});

const exploreHiddenGemsFlow = ai.defineFlow(
  {
    name: 'exploreHiddenGemsFlow',
    inputSchema: ExploreHiddenGemsInputSchema,
    outputSchema: ExploreHiddenGemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
