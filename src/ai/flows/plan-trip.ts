
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
  - Class: {{{travelClass}}}

  Please provide a set of realistic travel options. Create one "eco mix" option which is a creative combination of transport.
  Then, provide at least three standard transport options (Flight, Train, Bus).
  Finally, recommend one high-quality hotel at the destination.

  Make the prices, durations, and ratings realistic for the given route. The destination for the recommended stay must be '{{{destination}}}'.

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
    const { output } = await prompt(input);
    return output!;
  }
);
