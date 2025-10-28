
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
  - **Origin:** {{{origin}}}
  - **Destination:** {{{destination}}}
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

  2.  **Plan Journey to Hub (if necessary):**
      - **Analyze the Origin:** First, check if the user's origin (e.g., 'Avadh Heliconia Homes, Vapi, India') is a major city with its own international airport.
      - **If NOT a Major Hub:** Your first step is to create a detailed, multi-modal plan to get from the user's specific origin to the nearest major transport hub (e.g., 'Chhatrapati Shivaji Maharaj International Airport, Mumbai').
      - **Provide Detailed Segments:** Populate the 'journeyToHub' field with a step-by-step guide. For example: "Take a 15-min auto-rickshaw to Vapi Railway Station. Then, take the Gujarat Express train to Mumbai Central. Finally, take a 45-min taxi to the airport." Make sure the travel times are realistic.
      - The 'journeyToHub' field should only be used if this preliminary travel is necessary.

  3.  **Generate Mock Booking Options:**
      - These options should be for the main journey from the identified transport hub to the final destination (e.g., Mumbai to Madrid).
      - Create a list of 3-4 realistic but *mock* booking options. Include a mix of flights, trains, or buses where appropriate.
      - For each option, provide a provider, details, duration, price (in the requested currency), and a fake booking URL.

  4.  **Generate a Day-by-Day Itinerary:** For each day of the trip, create a detailed plan.
      - Each day needs a **title** and a brief **summary**.
      - For each activity, provide:
        - **Time:** A specific start time (e.g., "09:00 AM").
        - **Description:** A clear description of the activity (e.g., "Guided tour of the Prado Museum").
        - **Location:** The address or name of the place.
        - **Details:** Practical tips, booking information, or why it's a great spot.
      - **Include Detailed Transportation:** Between each activity, add a 'transportToNext' segment.
        - **Be specific and multi-modal.** Instead of just "Take the metro", provide a detailed, cost-effective route like in Google Maps. For example: "Take a 5-min taxi to Ramvadi Metro Station, then take the Aqua Line metro for 20 mins to Pune Railway Station."
        - Specify the mode (e.g., Walk, Metro, E-bike, Bus, Taxi).
        - Provide a realistic duration (e.g., "25 minutes").
        - Give a short, clear description of the route.
        - **Prioritize Eco-Friendly & Cost-Effective Options:** Mark walking, cycling, or public transport as 'ecoFriendly: true'. Suggest taxis or ride-shares only when necessary.
      - **Be Realistic:** Ensure the plan is logical for the chosen tripPace. A 'relaxed' pace should have fewer activities and more leisure time than a 'fast-paced' one.
      - **Incorporate User Interests:** If the user mentions specific places, like visiting Santiago Bernabéu and the Atlético stadium in Madrid, be sure to include them in the itinerary on different days.

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
      model: 'googleai/gemini-pro',
    });
    return output!;
  }
);
