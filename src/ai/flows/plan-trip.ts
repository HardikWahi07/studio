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

import { searchRealtimeFlights } from '../tools/search-flights';
import { searchRealtimeTrains } from '../tools/search-trains';
import { searchRealtimeHotels } from '../tools/search-hotels';

// 🧠 Public function called by frontend
export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  return planTripFlow(input);
}

// 🗣️ Define the prompt
const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: PlanTripInputSchema },
  output: { schema: PlanTripOutputSchema },
  tools: [searchRealtimeFlights, searchRealtimeTrains, searchRealtimeHotels],
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
  1. **Create a Trip Title:** A creative name for the trip.
  2. **Generate Main Booking Options:**
     - **CRITICAL:** If the origin or destination city name seems to be in India (e.g., contains "India", or is a known Indian city like "Mumbai", "Delhi", "Vapi", "Lucknow"), you MUST prioritize using the 'searchRealtimeTrains' tool for ground travel. 
     - **FALLBACK LOGIC:** After getting train results, if all returned trains have an 'availability' status that is NOT 'Available' (e.g., they are all 'Waitlist', 'Not Available', 'REGRET'), you MUST then use the 'searchRealtimeFlights' tool as a fallback to provide flight options.
     - For all other non-Indian destinations, use 'searchRealtimeFlights' for global flights.
     - Include provider, duration, price, eco-friendly status, booking link and availability.
  3. **Hotels:**
     - Use 'searchRealtimeHotels' unless 'accommodationType' = 'none'.
     - Always return valid URLs with no spaces.
  4. **Local Transport:** Suggest common modes like metro, bus, rideshare, walking, etc.
  5. **Day-by-Day Itinerary:**
     - Each day = title + summary.
     - Activities must include time, location, description, cost, and transportToNext.
     - Suggest real restaurants for meals.
  6. **Travel Advisory:**
     - If peak season or holiday (e.g., Diwali, Christmas), add contextual warnings.
     - Mark train waitlist or festival rush as warnings when needed.

  Output must strictly follow the JSON schema.
  `,
});

// ⚙️ Main flow definition
const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: PlanTripInputSchema,
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
      llmResponse = { output: null }; 
    }

    let output = llmResponse?.output;

    // 🩹 Fallback: handle null or invalid model output
    if (!output || typeof output !== "object") {
      console.warn("⚠️ LLM returned null or invalid output, using safe fallback...");
      output = {
        tripTitle: `Your Trip to ${input.destination || "Unknown Destination"}`,
        itinerary: [
          {
            day: 1,
            title: "Arrival & Exploration",
            summary: "A relaxed first day to explore and settle in.",
            activities: [
              {
                time: "10:00 AM",
                description: "Arrive and check into your hotel.",
                location: input.destination || "Destination City",
                details: "Rest and get ready for the adventure ahead!",
                cost: "Included",
                transportToNext: null
              },
              {
                time: "4:00 PM",
                description: "Evening walk around the local area.",
                location: "City Center",
                details: "Enjoy street food or coffee nearby.",
                cost: "Approx. $10",
                transportToNext: {
                  mode: "Walk",
                  duration: "15 minutes",
                  description: "Leisurely stroll through the neighborhood.",
                  ecoFriendly: true
                }
              }
            ]
          }
        ],
        bookingOptions: [],
        hotelOptions: [],
        localTransportOptions: [
          {
            type: "metro",
            provider: "City Metro",
            details: "Fastest way around the city.",
            averageCost: "$2 per ride",
            tip: "Buy a daily metro card for unlimited rides."
          },
          {
            type: "rideshare",
            provider: "Uber / Ola",
            details: "Available 24/7.",
            averageCost: "$10-15 per ride",
            tip: "Use off-peak hours for cheaper fares."
          }
        ]
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
