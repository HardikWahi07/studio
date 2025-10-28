
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
  prompt: `You are a powerful geocoding assistant. Your job is to take a user's search query and return a list of precise, well-formatted location suggestions. You can handle a wide range of inputs, from specific addresses and building names to neighborhoods, cities, and airports.

  **User's Search Query:** "{{{query}}}"

  **Your Task:**

  1.  **Analyze the Query:** Understand the user's input, whether it's a full address, a point of interest, a neighborhood, or just a city.
  2.  **Generate Suggestions:** Provide a list of up to 10 relevant location suggestions.
  3.  **Format Correctly:** For each suggestion, provide a clear, descriptive name. Include as much detail as is relevant, such as the point of interest, neighborhood, city, state/province, and country.

  **Examples:**
  - If the query is "avadh heliconia vapi", you should suggest "Avadh Heliconia Homes, Tukwada, Vapi, Gujarat, India".
  - If the query is "eiffel tower", you should suggest "Eiffel Tower, Paris, France".
  - If the query is "lohegaon", you could suggest both "Lohegaon, Pune, Maharashtra, India" and "Pune International Airport (PNQ), Pune, India".

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
