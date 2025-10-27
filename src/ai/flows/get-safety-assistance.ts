'use server';

/**
 * @fileOverview A safety chatbot that provides real-time safety alerts,
 * locations of nearby hospitals, and assistance during emergencies.
 *
 * - getSafetyAssistance - A function that handles the safety assistance process.
 * - GetSafetyAssistanceInput - The input type for the getSafetyAssistance function.
 * - GetSafetyAssistanceOutput - The return type for the getSafetyAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSafetyAssistanceInputSchema = z.object({
  location: z
    .string()
    .describe("The user's current location (e.g., city, state, country)."),
  emergencyType: z
    .string()
    .describe(
      'The type of emergency the user is experiencing (e.g., medical, crime, natural disaster, feeling lost).'
    )
    .optional(),
  details: z
    .string()
    .describe("Any additional details about the user's situation.")
    .optional(),
});
export type GetSafetyAssistanceInput = z.infer<typeof GetSafetyAssistanceInputSchema>;

const GetSafetyAssistanceOutputSchema = z.object({
  safetyAlert: z
    .string()
    .describe('Any relevant safety alerts for the user location.'),
  nearbyHospitals: z
    .string()
    .describe('A list of nearby hospitals and their contact information.'),
  assistanceMessage: z
    .string()
    .describe(
      'A helpful, reassuring message providing guidance and assistance based on the user situation, as if you are a knowledgeable local friend.'
    ),
});
export type GetSafetyAssistanceOutput = z.infer<typeof GetSafetyAssistanceOutputSchema>;

export async function getSafetyAssistance(
  input: GetSafetyAssistanceInput
): Promise<GetSafetyAssistanceOutput> {
  return getSafetyAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSafetyAssistancePrompt',
  input: {schema: GetSafetyAssistanceInputSchema},
  output: {schema: GetSafetyAssistanceOutputSchema},
  prompt: `You are a helpful and reassuring AI safety assistant, acting as a knowledgeable local supporter for a traveler.

  The user is in: {{{location}}}.
  Their situation is: {{{emergencyType}}}.
  Details: {{{details}}}

  Your role is to provide clear, calm, and actionable advice.

  1.  **Safety Alert:** Provide any critical safety alerts for the location (e.g., transport strikes, weather warnings, areas to avoid). If there are no specific alerts, say so.
  2.  **Nearby Hospitals:** List at least two nearby hospitals with their full addresses and contact numbers.
  3.  **Assistance Message:** Write a message as if you are a local friend helping them.
      - If they are lost, provide specific, simple steps to get oriented. Suggest finding a major landmark, asking for directions to a specific square or station, or using a well-known public transport line.
      - Give practical safety tips relevant to their situation (e.g., "In Madrid, keep your bag in front of you," or "Look for official taxi stands.").
      - Be reassuring and supportive in your tone.
  `,
});

const getSafetyAssistanceFlow = ai.defineFlow(
  {
    name: 'getSafetyAssistanceFlow',
    inputSchema: GetSafetyAssistanceInputSchema,
    outputSchema: GetSafetyAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
