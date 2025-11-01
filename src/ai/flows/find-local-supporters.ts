'use server';

/**
 * @fileOverview An AI agent for generating fictional local supporters for a travel destination.
 *
 * - findLocalSupporters - A function that returns a list of AI-generated local supporters.
 * - FindLocalSupportersInput - The input type for the findLocalSupporters function.
 * - FindLocalSupportersOutput - The return type for the findLocalSupporters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single supporter, matching the frontend type
export const LocalSupporterSchema = z.object({
    id: z.string().describe("A unique identifier for the supporter, e.g., 'supporter-maria-g'"),
    name: z.string().describe("The supporter's full name, e.g., 'Maria G.'"),
    bio: z.string().describe("A short, engaging bio (2-3 sentences) describing their personality, interests, and connection to the location."),
    location: z.string().describe("The city and country of the supporter, e.g., 'Madrid, Spain'"),
    languages: z.array(z.string()).describe("A list of languages the supporter speaks, e.g., ['Spanish', 'English']"),
    avatarUrl: z.string().url().describe("A URL for a fictional avatar image from i.pravatar.cc, e.g., 'https://i.pravatar.cc/150?u=maria'"),
});
export type LocalSupporter = z.infer<typeof LocalSupporterSchema>;


const FindLocalSupportersInputSchema = z.object({
  location: z.string().describe('The travel destination city and country, e.g., "Tokyo, Japan".'),
});
export type FindLocalSupportersInput = z.infer<typeof FindLocalSupportersInputSchema>;

const FindLocalSupportersOutputSchema = z.object({
  supporters: z.array(LocalSupporterSchema).describe('A list of 4-8 diverse, AI-generated local supporters.'),
});
export type FindLocalSupportersOutput = z.infer<typeof FindLocalSupportersOutputSchema>;


export async function findLocalSupporters(input: FindLocalSupportersInput): Promise<FindLocalSupportersOutput> {
  return findLocalSupportersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findLocalSupportersPrompt',
  input: {schema: FindLocalSupportersInputSchema},
  output: {schema: FindLocalSupportersOutputSchema},
  prompt: `You are an expert travel assistant who creates fictional, friendly AI "local supporters" to help travelers.

  For the destination "{{{location}}}", generate a diverse list of 4 to 8 unique AI supporter personas.

  Each supporter MUST have:
  - A unique ID.
  - A believable name.
  - A short, welcoming bio that highlights their personality, hobbies, and connection to the city. Make them sound like friendly, real people.
  - The requested location (city, country).
  - A list of languages they "speak".
  - A unique, functional avatar URL from i.pravatar.cc, using their name as the unique key (e.g., https://i.pravatar.cc/150?u=kenji).

  Do NOT include real people. These are creative, fictional AI personas.
  Ensure the list is diverse in terms of age, gender, and interests.
  Return the final list in the requested JSON format.
  `,
});

const findLocalSupportersFlow = ai.defineFlow(
  {
    name: 'findLocalSupportersFlow',
    inputSchema: FindLocalSupportersInputSchema,
    outputSchema: FindLocalSupportersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { supporters: [] };
    }
    return output;
  }
);
// final commit
