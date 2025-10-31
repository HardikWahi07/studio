
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
  1. **Create a Trip Title:** A creative name for the trip.
  2. **Generate Main Booking Options (CRITICAL LOGIC):**
      - **For ALL domestic travel within India:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for these mock trains MUST be a valid, pre-filled ixigo.com search URL. Example format: \`https://www.ixigo.com/trains/mumbai-central-bct/to/new-delhi-ndls?date=25-12-2024\`
      - **For ALL routes (including India):** Generate 2-3 realistic MOCK flight options. The \`bookingLink\` for these mock flights MUST be a valid, pre-filled Google Flights URL. Example format: \`https://www.google.com/flights?q=flights+from+Mumbai+to+Delhi+on+2024-12-25\`
  3. **Hotels:**
     - Generate 2-3 realistic MOCK hotel options unless 'accommodationType' is 'none'. The \`bookingLink\` should be a valid, pre-filled Booking.com search URL. Example format: \`https://www.booking.com/searchresults.html?ss=New%20Delhi&checkin={{{departureDate}}}&checkout={{{checkoutDate}}}\`
  4. **Local Transport:** Suggest common modes like metro, bus, rideshare, walking, etc.
  5. **Day-by-Day Itinerary:**
     - Each day = title + summary.
     - Activities must include time, location, description, cost, and transportToNext.
     - Suggest real restaurants for meals based on interests.
  6. **Travel Advisory:**
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
    let llmResponse;
    
    // 🛡️ Safety wrapper for LLM call
    try {
      console.log('[/src/ai/flows/plan-trip.ts] Calling prompt with input: ', input);
      llmResponse = await prompt(input);
    } catch (err) {
      console.error("❌ LLM prompt failed:", err);
      // Ensure we always have an llmResponse object to check
      llmResponse = { output: null, history: [] }; 
    }

    let output = llmResponse?.output;

    // 🩹 Fallback: handle null or invalid model output
    if (!output || typeof output !== "object") {
      console.warn("⚠️ LLM returned null or invalid output, using safe fallback...");
      output = {
        tripTitle: `Your Trip to ${input.destination || "Unknown Destination"}`,
        itinerary: [],
        bookingOptions: [],
        hotelOptions: [],
        localTransportOptions: []
      };
    }

    // ✅ Ensure schema-required fields exist
    if (!output.tripTitle) {
      output.tripTitle = `Your Trip to ${input.destination || "Unknown Destination"}`;
    }
    if (!Array.isArray(output.itinerary)) output.itinerary = [];
    if (!Array.isArray(output.bookingOptions)) output.bookingOptions = [];
    if (!Array.isArray(output.hotelOptions)) output.hotelOptions = [];
    if (!Array.isArray(output.localTransportOptions)) output.localTransportOptions = [];

    return output;
  }
);
