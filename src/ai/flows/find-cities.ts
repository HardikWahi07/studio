
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
  query: z.string().describe('The search term for finding a location.'),
});
export type FindCitiesInput = z.infer<typeof FindCitiesInputSchema>;

const FindCitiesOutputSchema = z.object({
  cities: z
    .array(z.string())
    .describe('A list of location names that match the query, including city, state, and country where applicable. Example: ["Lohegaon, Pune, India", "Pune, Maharashtra, India"]'),
});
export type FindCitiesOutput = z.infer<typeof FindCitiesOutputSchema>;

export async function findCities(input: FindCitiesInput): Promise<FindCitiesOutput> {
  return findCitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findCitiesPrompt',
  input: { schema: FindCitiesInputSchema },
  output: { schema: FindCitiesOutputSchema },
  prompt: `You are a helpful location search assistant. You suggest locations based on a user's search query, including cities, neighborhoods, airports, and points of interest.

  The user is searching for: {{{query}}}

  Provide a list of up to 10 matching locations. For each location, provide a descriptive name including the city, state/province, and country.
  For example, if the query is "lohegaon", you might suggest "Lohegaon, Pune, India" or "Pune International Airport (PNQ), Pune, India".

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
