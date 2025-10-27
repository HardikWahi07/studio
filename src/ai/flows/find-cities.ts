
'use server';
/**
 * @fileOverview An AI agent for finding cities based on a search query.
 *
 * - findCities - A function that returns a list of cities matching a query.
 * - FindCitiesInput - The input type for the findCities function.
 * - FindCitiesOutput - The return type for the findCities function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindCitiesInputSchema = z.object({
  query: z.string().describe('The search term for finding a city.'),
});
export type FindCitiesInput = z.infer<typeof FindCitiesInputSchema>;

const FindCitiesOutputSchema = z.object({
  cities: z
    .array(z.string())
    .describe('A list of city names that match the query, including country. Example: ["Paris, France", "Paris, Texas, USA"]'),
});
export type FindCitiesOutput = z.infer<typeof FindCitiesOutputSchema>;

export async function findCities(input: FindCitiesInput): Promise<FindCitiesOutput> {
  return findCitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findCitiesPrompt',
  input: { schema: FindCitiesInputSchema },
  output: { schema: FindCitiesOutputSchema },
  prompt: `You are a helpful assistant that suggests cities based on a user's search query.

  The user is searching for: {{{query}}}

  Provide a list of up to 10 matching cities. For each city, include its country. If relevant, also include the state or province.
  For example, if the query is "san jo", you might suggest "San Jose, California, USA", "San José, Costa Rica", etc.

  Return the result in the requested JSON format.
  `,
});

const findCitiesFlow = ai.defineFlow(
  {
    name: 'findCitiesFlow',
    inputSchema: FindCitiesInputSchema,
    outputSchema: FindCitiesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
