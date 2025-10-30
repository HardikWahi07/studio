
'use server';
/**
 * @fileOverview An AI agent for planning a detailed, multi-day trip itinerary.
 *
 * - planTrip - A function that returns a comprehensive trip plan.
 */

import { ai } from '@/ai/genkit';
import { PlanTripInputSchema, PlanTripOutputSchema, type PlanTripInput, type PlanTripOutput } from './plan-trip.types';
import { searchRealtimeFlights } from '../tools/search-flights';
import { searchRealtimeTrains } from '../tools/search-trains';
import { getTrainAvailability } from '../tools/get-train-availability';

export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  return planTripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: PlanTripInputSchema },
  output: { schema: PlanTripOutputSchema },
  tools: [searchRealtimeFlights, searchRealtimeTrains, getTrainAvailability],
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
      - **CRITICAL: You MUST use the provided tools to find real-time travel options.**
      - **For flights, you MUST use the 'searchRealtimeFlights' tool.** Use the user's origin, destination, and departure date. If the tool returns valid flights, integrate them as 'flight' type booking options.
      - **For trains, you MUST use the 'searchRealtimeTrains' tool.** If it returns trains, you **MUST** then use the 'getTrainAvailability' tool to check the live status (Available, Waitlist, Sold Out) for those trains.
      - **Generate 1-2 realistic mock bus options** as a fallback if flights or trains are not suitable for the route.
      - For each option, provide the provider/name, details (like departure/arrival times, flight/train numbers), duration, price (in the requested {{{currency}}}), its eco-friendly status, and a fake booking URL (e.g., "https://www.example.com/book").
      - Set availability to 'Available' for all real-time options found, unless 'getTrainAvailability' provides a different status (like 'Waitlist' or 'Sold Out').

  3.  **Generate Mock Hotel Options:**
      - If the user's accommodation preference ('accommodationType') is 'none', you MUST NOT suggest any hotels. Return an empty array for 'hotelOptions'.
      - Otherwise, suggest 3-4 realistic but *mock* hotel options based on accommodation preference ({{{accommodationType}}}) and budget ({{{accommodationBudget}}}).
      - Provide name, style, estimated price, mock rating, and a fake booking URL.
  
  4.  **Generate Local Transport Options:**
      - Recommend 3-4 common transport options for the destination city (e.g., metro, bus, rideshare).
      - Provide type, provider, details, average cost, and a helpful tip.

  5.  **Generate a Day-by-Day Itinerary:** For each day of the trip, create a detailed plan.
      - Each day needs a **title** and a **summary**.
      - For each activity, provide:
        - **Time:** A specific start time.
        - **Description:** Clear description of the activity.
        - **Location:** Address or name of the place.
        - **Details:** Practical tips or booking info.
        - **Cost:** Estimated cost in the specified {{{currency}}}.
      - **CRITICAL: For "Lunch," "Dinner," or "Coffee," suggest a specific, real business** based on user interests.
      - **MANDATORY: Include Detailed Transportation:** Between each activity, add a 'transportToNext' segment with mode, estimated time, and route.
      - **Be Realistic:** Ensure the plan is logical for the chosen tripPace.

  6.  **Add Contextual Travel Advisory:**
      - **CRITICAL:** Analyze the user's travel dates ({{{departureDate}}}) and destination ({{{destination}}}) for potential conflicts with major public holidays, festivals (like Diwali in India, Christmas in Europe, etc.), or peak tourist seasons.
      - If you identify a peak travel period, you **MUST** add a warning in the 'details' section of the relevant booking options.
      - **Example:** If a train is waitlisted during Diwali, the details should say: "WL7 - High waitlist due to Diwali festival rush. Confirmation is unlikely. Consider booking flights or traveling on a different date."
      - If no major events are found, no advisory is needed.

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
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      // If the model returns null, throw a more specific error.
      // This can be caught by the calling function on the front-end.
      throw new Error("AI model failed to generate a valid itinerary. The response was empty.");
    }
    
    // Ensure bookingOptions is always an array to prevent downstream errors.
    if (!output.bookingOptions) {
      output.bookingOptions = [];
    }

    return output;
  }
);
