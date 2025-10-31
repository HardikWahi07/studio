
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
      - **Flights:** First, determine if a direct flight is plausible. For example, there are no direct commercial flights to Shimla; a user would need to fly to Chandigarh (IXC) and take a taxi.
      - **Trains:** Similarly, for trains, identify the nearest major railway stations for the origin and destination. For example, for "Vapi to Lohegaon", the correct route is Vapi (VAPI) to Pune Junction (PUNE), not Lohegaon.
      - If a direct route is not possible, you MUST create a multi-leg journey (e.g., Flight + Taxi, or Train + Bus).
  2.  **Generate Main Booking Options:**
      - **For ALL domestic travel within India:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for these mock trains MUST be a valid, pre-filled ixigo.com search URL in the format \`https://www.ixigo.com/trains/search/{FROM_STATION_CODE}/{TO_STATION_CODE}/{DDMMYYYY}\`. To make the data realistic, the 'availability' field for these trains should sometimes be 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or 'Sold Out'.
      - **For ALL routes (including India):** Generate 2-3 realistic MOCK flight options. Flights are almost always available, so use 'Available' or 'N/A'. For peak seasons, you can set availability to 'N/A' and add a note to the 'details' field like "Prices higher than usual". The \`bookingLink\` for these mock flights MUST be a valid, pre-filled, and properly URL-encoded Google Flights URL using the user's input. There must be no spaces in the URL.
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
