
'use server';
/**
 * @fileOverview An AI agent for planning a trip with transport and accommodation.
 *
 * - planTrip - A function that returns transport and hotel options.
 * - PlanTripInput - The input type for the planTrip function.
 * - PlanTripOutput - The return type for the planTrip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PlanTripInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The date of departure.'),
  travelers: z.number().describe('The number of people traveling.'),
  travelClass: z.string().describe('The class of travel (e.g., economy, business).'),
});
export type PlanTripInput = z.infer<typeof PlanTripInputSchema>;

export const PlanTripOutputSchema = z.object({
  ecoMix: z
    .object({
      title: z.string(),
      description: z.string(),
      duration: z.string(),
      cost: z.number(),
      carbonValue: z.number().min(1).max(3),
    })
    .optional(),
  transportOptions: z.array(
    z.object({
      mode: z.string().describe('Transport mode (e.g., Flight, Train, Bus).'),
      duration: z.string(),
      cost: z.number(),
      carbonValue: z.number().min(1).max(3).describe('An integer from 1 (low) to 3 (high).'),
      recommendation: z.string().optional(),
    })
  ),
  recommendedStay: z.object({
    name: z.string().describe('Name of the hotel.'),
    location: z.string().describe('City of the hotel.'),
    rating: z.number(),
    reviews: z.string(),
    pricePerNight: z.number(),
  }),
});
export type PlanTripOutput = z.infer<typeof PlanTripOutputSchema>;

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
