
'use server';
/**
 * @fileOverview An AI agent for planning a detailed, multi-day trip itinerary.
 *
 * - planTrip - A function that returns a comprehensive trip plan.
 */

import { ai } from '@/ai/genkit';
import { 
  PlanTripInputSchema, 
  PlanTripOutputSchema, 
  type PlanTripInput, 
  type PlanTripOutput 
} from './plan-trip.types';
import { add } from 'date-fns';
import { z } from 'zod';

// 🧠 Public function called by frontend
export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  const checkinDate = new Date(input.departureDate);
  const checkoutDate = add(checkinDate, { days: input.tripDuration });

  const flowInput = {
    ...input,
    checkoutDate: checkoutDate.toISOString().split('T')[0],
  };
  return planTripFlow(flowInput);
}

// 🗣️ Define the prompt
const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: z.intersection(PlanTripInputSchema, z.object({ checkoutDate: z.string() })) },
  output: { schema: PlanTripOutputSchema },
  prompt: `You are a world-class AI trip planner. Your task is to create a detailed, day-by-day itinerary that is both inspiring and practical, with valid, working booking links.

  **User's Trip Preferences:**
  - **Origin:** {{{origin}}}
  - **Destination:** {{{destination}}}
  - **Departure Date:** {{{departureDate}}} (Format: YYYY-MM-DD)
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
  - **Hotel Check-out Date:** {{{checkoutDate}}} (Format: YYYY-MM-DD)


  **CRITICAL TASK: GENERATE VALID, RELIABLE BOOKING LINKS**

  You MUST generate a valid, URL-encoded \`bookingLink\` for every transport and hotel option. Follow these rules precisely:

  1.  **ANALYZE THE ROUTE (CRITICAL LOGIC):**
      - **Nearest Hubs:** First, determine the nearest major airport (IATA code) and railway station (station code) for both the origin and destination.
      - **Multi-leg Journeys:** If a direct flight or train is not plausible (e.g., Vapi to Shimla), you MUST create a multi-leg journey. For example: Leg 1 flight to the nearest airport, Leg 2 ground transport.

  2.  **GENERATE BOOKING OPTIONS WITH SMART LINKS:**

      - **FLIGHTS:** The \`bookingLink\` MUST be a valid, URL-encoded Google Flights search URL.
        - **FORMAT:** \`https://www.google.com/travel/flights?q=flights%20from%20{ORIGIN_IATA}%20to%20{DESTINATION_IATA}%20on%20{YYYY-MM-DD}\`
        - **EXAMPLE:** For a flight from Mumbai (BOM) to Delhi (DEL) on 2025-12-20, the URL is: \`https://www.google.com/travel/flights?q=flights%20from%20BOM%20to%20DEL%20on%202025-12-20\`

      - **TRAINS:** The \`bookingLink\` MUST also be a valid, URL-encoded Google Flights search URL, which can handle train searches.
        - **FORMAT:** \`https://www.google.com/travel/flights?q=trains%20from%20{ORIGIN_STATION_CODE}%20to%20{DESTINATION_STATION_CODE}%20on%20{YYYY-MM-DD}\`
        - **EXAMPLE:** For a train from Vapi (VAPI) to Pune (PUNE) on 2025-12-20, the URL is: \`https://www.google.com/travel/flights?q=trains%20from%20VAPI%20to%20PUNE%20on%202025-12-20\`
        - Provide mock availability data ('Available', 'Waitlist', 'Sold Out').

      - **HOTELS:** The \`bookingLink\` MUST be a valid, URL-encoded Booking.com search URL.
        - **FORMAT:** \`https://www.booking.com/searchresults.html?ss={DESTINATION}&checkin={YYYY-MM-DD}&checkout={YYYY-MM-DD}\`
        - **EXAMPLE:** For a hotel in Paris from 2025-12-20 to 2025-12-25, the URL is: \`https://www.booking.com/searchresults.html?ss=Paris&checkin=2025-12-20&checkout=2025-12-25\`
        - The destination 'ss' parameter must be URL-encoded (e.g., 'New York' becomes 'New%20York').

  3.  **DAY-BY-DAY ITINERARY:**
      - Each day = title + summary.
      - Activities must include time, location, description, cost, and transportToNext.
      - Suggest real restaurants for meals based on interests.

  4.  **TRAVEL ADVISORY:**
      - If peak season or holiday (e.g., Diwali, Christmas), add contextual warnings.

  Output must strictly follow the JSON schema. NO spaces or invalid characters in URLs.
  `,
});

// ⚙️ Main flow definition
const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: z.intersection(PlanTripInputSchema, z.object({ checkoutDate: z.string() })),
    outputSchema: PlanTripOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    // 🩹 Fallback: handle null or invalid model output
    if (!output || typeof output !== "object" || !output.tripTitle) {
      console.error("AI returned null or invalid output for trip plan. Input was:", input);
      throw new Error("The AI model failed to generate a valid trip plan.");
    }

    // ✅ Ensure schema-required arrays exist to prevent UI errors
    if (!Array.isArray(output.itinerary)) output.itinerary = [];
    if (!Array.isArray(output.bookingOptions)) output.bookingOptions = [];
    if (!Array.isArray(output.hotelOptions)) output.hotelOptions = [];
    if (!Array.isArray(output.localTransportOptions)) output.localTransportOptions = [];

    return output;
  }
);
