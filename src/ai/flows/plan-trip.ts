
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
  - **Accommodation Budget:** {{{accommodationBudget}}}
  - **Plane Class Preference:** {{{planeClass}}}
  - **Train Class Preference:** {{{trainClass}}}
  - **Interests & Food Preferences:** {{{interests}}}
  - **Desired Currency for Costs:** {{{currency}}}

  **Your Task:**

  1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.
  
  2.  **Generate Main Booking Options:**
      - **CRITICAL:** You MUST generate a list of 3-4 realistic but *mock* booking options for the main journey from origin to destination.
      - Include a mix of flights, trains, and buses where appropriate for the distance.
      - For each option, provide a provider, details, duration, price (in the requested {{{currency}}}), its eco-friendly status, and a fake booking URL (e.g., "https://www.example.com/book").
      - For train options, especially in India, include different travel classes like "AC First Class (1A)", "AC 2 Tier (2A)", "Shatabdi Express (CC)", or "Vande Bharat (EC)" in the details field. If the user specified a trainClass preference, prioritize suggestions in that class.
      - For flights, use providers like 'IndiGo', 'Vistara', 'Air India', etc. If the user specified a planeClass preference, prioritize suggestions in that class.

  3.  **Generate Mock Hotel Options:**
      - If the user's accommodation preference ('accommodationType') is 'none', you MUST NOT suggest any hotels. Skip this section entirely and return an empty array for 'hotelOptions'.
      - Otherwise, based on the user's accommodation preference ({{{accommodationType}}}) and budget ({{{accommodationBudget}}}), suggest 3-4 realistic but *mock* hotel options in the destination.
      - For each hotel, provide its name, style (e.g., 'Luxury', 'Boutique'), estimated price per night, a mock rating, and a fake booking URL.
  
  4.  **Generate Local Transport Options:**
      - Recommend 3-4 common and useful local transport options for getting around the destination city (e.g., metro, bus, taxi, rideshare like Uber, auto-rickshaw, bike rentals).
      - For each option, provide the type, a provider name, details, an estimated average cost, and a helpful tip for travelers.

  5.  **Generate a Day-by-Day Itinerary:** For each day of the trip, create a detailed plan.
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

  Produce the final output in the required JSON format, ensuring the 'bookingOptions' array is always populated.
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
    
    if (!output) {
      throw new Error("Failed to generate itinerary.");
    }
    
    // Ensure bookingOptions is always an array
    if (!output.bookingOptions) {
      output.bookingOptions = [];
    }

    return output;
  }
);
