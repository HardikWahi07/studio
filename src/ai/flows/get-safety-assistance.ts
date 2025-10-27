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
      'The type of emergency the user is experiencing (e.g., medical, crime, natural disaster).'
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
      'A message providing guidance and assistance based on the user situation.'
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
  prompt: `You are a safety chatbot providing assistance to travelers.

  Based on the user's location ({{{location}}}), emergency type ({{{emergencyType}}}), and any additional details ({{{details}}}), provide the following information:

  1.  Safety Alert:  Provide any relevant safety alerts for the user's current location.
  2.  Nearby Hospitals:  List nearby hospitals and their contact information.
  3.  Assistance Message:  Provide guidance and assistance based on the user's situation. This could include steps to take, contact information for local authorities, or other helpful information.
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
