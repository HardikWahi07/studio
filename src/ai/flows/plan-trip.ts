
'use server';
/**
 * @fileOverview An AI agent for planning a detailed, multi-day trip itinerary.
 *
 * - planTrip - A function that returns a comprehensive trip plan.
 */

import { ai } from '@/ai/genkit';
import { PlanTripInputSchema, PlanTripOutputSchema, type PlanTripInput, type PlanTripOutput } from './plan-trip.types';
import { suggestTransportOptions } from './suggest-transport-options';

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
  - **Accommodation Budget:** {{{accommodationBudget}}}
  - **Interests & Food Preferences:** {{{interests}}}
  - **Desired Currency for Costs (if mentioned):** {{{currency}}}

  **Your Task:**

  1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.

  2.  **Generate Mock Hotel Options:**
      - If the user's accommodation preference ('accommodationType') is 'none', you MUST NOT suggest any hotels. Skip this section entirely.
      - Otherwise, based on the user's accommodation preference ({{{accommodationType}}}) and budget ({{{accommodationBudget}}}), suggest 3-4 realistic but *mock* hotel options in the destination.
      - For each hotel, provide its name, style (e.g., 'Luxury', 'Boutique'), estimated price per night, a mock rating, and a fake booking URL.
  
  3.  **Generate Local Transport Options:**
      - Recommend 3-4 common and useful local transport options for getting around the destination city (e.g., metro, bus, taxi, rideshare like Uber, bike rentals).
      - For each option, provide the type, a provider name, details, an estimated average cost, and a helpful tip for travelers.

  4.  **Generate a Day-by-Day Itinerary:** For each day of the trip, create a detailed plan.
      - Each day needs a **title** and a brief **summary**.
      - For each activity, provide:
        - **Time:** A specific start time (e.g., "09:00 AM").
        - **Description:** A clear description of the activity (e.g., "Guided tour of the Prado Museum").
        - **Location:** The address or name of the place.
        - **Details:** Practical tips, booking information, or why it's a great spot.
      - **CRITICAL: For activities like "Lunch," "Dinner," "Coffee," or "Rest," you MUST suggest a specific, real business.** Base your suggestion on the user's interests (e.g., if they like "street food," find a highly-rated street food vendor; if they prefer "fine dining," find a suitable restaurant). For the 'location' field of that activity, provide the real name and address of the business. In the 'details' field, briefly explain why you chose it.
      - **Include Detailed Transportation:** Between each activity, add a 'transportToNext' segment.
        - **Estimate travel times.** Be specific and multi-modal. Instead of just "Take the metro", suggest a route.
        - **Prioritize Eco-Friendly & Cost-Effective Options:** Mark walking, cycling, or public transport as 'ecoFriendly: true'. Suggest taxis or ride-shares only when necessary.
      - **Be Realistic:** Ensure the plan is logical for the chosen tripPace. A 'relaxed' pace should have fewer activities and more leisure time than a 'fast-paced' one.
      - **Incorporate User Interests:** If the user mentions specific places, be sure to include them in the itinerary on different days.

  You are NOT responsible for generating main booking options (flights, etc.). That will be handled by another service. Do not populate the 'bookingOptions' field.
  
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
    // Generate the main itinerary and hotel options
    const itineraryPromise = prompt(input);
    
    // Concurrently, generate the transport booking options
    const transportPromise = suggestTransportOptions({
      origin: input.origin,
      destination: input.destination,
      currency: input.currency
    });

    // Wait for both promises to resolve
    const [itineraryResult, transportOutput] = await Promise.all([itineraryPromise, transportPromise]);

    const itineraryOutput = itineraryResult.output;
    
    if (!itineraryOutput) {
      throw new Error("Failed to generate itinerary.");
    }

    const bookingOptions = [];
    if (transportOutput?.best) bookingOptions.push(transportOutput.best);
    if (transportOutput?.cheapest) bookingOptions.push(transportOutput.cheapest);
    if (transportOutput?.eco) bookingOptions.push(transportOutput.eco);
    if (transportOutput?.other) bookingOptions.push(...transportOutput.other);
    
    // Combine the results
    return {
      ...itineraryOutput,
      bookingOptions,
    };
  }
);
