
'use server';
/**
 * @fileOverview An AI agent for planning a detailed, multi-day trip itinerary.
 *
 * - planTrip - A function that returns a comprehensive trip plan.
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
  prompt: `You are a world-class AI trip planner. Your task is to create a detailed, day-by-day itinerary that is both inspiring and practical.

  **User's Trip Preferences:**
  - **Destination:** {{{destination}}}
  - **Origin:** {{{origin}}}
  - **Departure Date:** {{{departureDate}}}
  - **Trip Duration:** {{{tripDuration}}} days
  - **Travelers:** {{{travelers}}}
  - **Travel Style:** {{{travelStyle}}}
  - **Trip Pace:** {{{tripPace}}}
  - **Accommodation Preference:** {{{accommodationType}}}
  - **Interests:** {{{interests}}}
  - **Desired Currency for Costs (if mentioned):** {{{currency}}}

  **Your Task:**

  1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.

  2.  **Generate a Day-by-Day Itinerary:** For each day of the trip, create a detailed plan.
      - Each day needs a **title** and a brief **summary**.
      - For each activity, provide:
        - **Time:** A specific start time (e.g., "09:00 AM").
        - **Description:** A clear description of the activity (e.g., "Guided tour of the Prado Museum").
        - **Location:** The address or name of the place.
        - **Details:** Practical tips, booking information, or why it's a great spot.
      - **Include Transportation:** Between each activity, add a `transportToNext` segment.
        - Specify the `mode` (e.g., Walk, Metro, E-bike, Bus, Taxi).
        - Provide a realistic `duration` (e.g., "15 minutes").
        - Give a short `description` of the route (e.g., "Take Metro Line 1 from Sol to Atocha").
        - **Prioritize Eco-Friendly Options:** Mark `ecoFriendly` as `true` for walking, cycling, or public transport. Suggest taxis or ride-shares only when necessary.
      - **Be Realistic:** Ensure the plan is logical for the chosen `tripPace`. A 'relaxed' pace should have fewer activities and more leisure time than a 'fast-paced' one.
      - **Example Given:** The user mentioned visiting Santiago Bernabéu and the Atlético stadium in Madrid on different days. Incorporate such specific interests if provided.

  Produce the final output in the required JSON format.
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
      model: 'googleai/gemini-2.5-flash-latest',
    });
    return output!;
  }
);
