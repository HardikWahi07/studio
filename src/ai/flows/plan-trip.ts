
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

  const flowInput: PlanTripInput & { checkoutDate: string } = {
    ...input,
    checkoutDate: checkoutDate.toISOString().split('T')[0]
  };
  return planTripFlow(flowInput);
}

// 🗣️ Define the prompt
const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: z.intersection(PlanTripInputSchema, z.object({ checkoutDate: z.string() })) },
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
  - **Check-out Date for Hotels:** {{{checkoutDate}}}

  **Your Task:**
  1.  **Analyze the Route (CRITICAL LOGIC):**
      - **Flights & Trains:** First, determine the nearest major airport and railway station for both the origin and destination.
      - If a direct flight or train is not plausible (e.g., Vapi to Shimla), you MUST create a multi-leg journey. For example, Leg 1 could be a flight to the nearest major airport, and Leg 2 could be ground transport (taxi, bus) to the final destination.

  2.  **Generate Main Booking Options:**
      - **URL ENCODING (CRITICAL):** All \`bookingLink\` URLs MUST be properly URL-encoded. There must be NO spaces or invalid characters in the final URL. Replace spaces with '+' or '%20'.
      - **Flights:** Generate 2-3 realistic MOCK flight options using a valid, pre-filled Google Flights URL.
      - **Trains (India):** For domestic travel within India, generate 2-3 realistic MOCK train options. The 'availability' field for these trains should realistically be 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or 'Sold Out'. The \`bookingLink\` MUST be a valid, pre-filled \`ixigo.com\` search URL in the format \`https://www.ixigo.com/trains/search/{FROM_STATION_CODE}/{TO_STATION_CODE}/{DDMMYYYY}\`.

  3.  **Hotels:**
      - Generate 2-3 realistic MOCK hotel options unless 'accommodationType' is 'none'. The \`bookingLink\` should be a valid, pre-filled Booking.com search URL. Example format: \`https://www.booking.com/searchresults.html?ss={{{destination}}}&checkin={{{departureDate}}}&checkout={{{checkoutDate}}}\`

  4.  **Local Transport:** Suggest common modes like metro, bus, rideshare, walking, etc.

  5.  **Day-by-Day Itinerary:**
      - Each day = title + summary.
      - Activities must include time, location, description, cost, and transportToNext.
      - Suggest real restaurants for meals based on interests.

  6.  **Travel Advisory:**
      - If peak season or holiday (e.g., Diwali, Christmas), add contextual warnings.

  Output must strictly follow the JSON schema.
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
