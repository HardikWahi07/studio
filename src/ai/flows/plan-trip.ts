
'use server';
/**
 * @fileOverview An AI agent for planning a trip with transport and accommodation.
 *
 * - planTrip - A function that returns transport and hotel options.
 */

import { ai } from '@/ai/genkit';
import { PlanTripInputSchema, PlanTripOutputSchema, type PlanTripInput, type PlanTripOutput } from './plan-trip.types';

export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  return planTripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: PlanTripInputSchema },
  output: { schema: PlanTripOutputSchema },
  prompt: `You are an expert trip planner. A user is planning a trip and needs transport and accommodation options.

  User's trip details:
  - Origin: {{{origin}}}
  - Destination: {{{destination}}}
  - Departure Date: {{{departureDate}}}
  - Travelers: {{{travelers}}}

  Please provide a set of realistic travel options. Your response must be in JSON.
  - CRITICAL: All costs must be in the local currency of the origin country. It is absolutely essential to use the correct currency symbol based on the origin country (e.g., use ₹ for India, $ for USA, € for France, £ for UK). Do not mix them up.
  - Create one "eco mix" option which is a creative combination of transport (e.g., part train, part electric bus).
  - Provide at least three standard transport options (Flight, Train, Bus).
  - For flights, if there is no direct flight from the origin, find the nearest major airport and mention that in the recommendation text. For example, for a trip from Vapi to Pune, you might suggest a flight from Surat or Mumbai.
  - Recommend three hotels at the destination with different types: one luxury, one budget, and one best value (high-rated but affordable).
  - Make the prices, durations, and ratings realistic for the given route and currency. The hotel location for all stays must be '{{{destination}}}'.

  Return the result in the requested JSON format.
  `,
});

const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: PlanTripInputSchema,
    outputSchema: PlanTripOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      ...input,
      model: 'googleai/gemini-2.5-flash-lite',
    });
    return output!;
  }
);

    