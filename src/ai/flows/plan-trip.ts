
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
import { searchRealtimeTrainsFree } from '../tools/search-trains-free';
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

const longTripSummaryPrompt = ai.definePrompt({
    name: 'longTripSummaryPrompt',
    input: { schema: PlanTripInputSchema },
    output: { schema: PlanTripOutputSchema },
    prompt: `You are a world-class AI trip planner. The user wants to plan an unusually long trip of {{{tripDuration}}} days. Generating a day-by-day itinerary is not feasible.

    **User's Trip Preferences:**
    - **Origin:** {{{origin}}}
    - **Destination:** {{{destination}}}
    - **Departure Date:** {{{departureDate}}}
    - **Total Duration:** {{{tripDuration}}} days
    - **Interests:** {{{interests}}}

    **Your Task:**
    1.  **Create a Trip Title:** A creative name for this extended journey.
    2.  **Generate a High-Level Summary:** Instead of a daily plan, create a summary in the 'itinerary' section. Create a single "Day 1" entry that contains the summary.
        -   **Title:** "High-Level Travel Strategy"
        -   **Summary:** Write a paragraph explaining that a day-by-day plan isn't practical, and you're providing a strategic overview instead.
        -   **Activities:** Create a few "activity" blocks that represent phases or suggestions for their long trip. For example:
            -   **First Month:** Suggest initial settling-in activities.
            -   **Seasonal Suggestions:** Recommend different regions or activities for different seasons they will experience (e.g., "Months 3-6 (Spring/Summer)").
            -   **Pacing Advice:** Give tips on how to manage such a long trip to avoid burnout.
    3.  **No Bookings:** Do not use any tools. Return empty arrays for 'bookingOptions', 'hotelOptions', and 'localTransportOptions'.
    
    Output must strictly follow the JSON schema.
    `,
});


// 🗣️ Define the prompt
const prompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: { schema: z.intersection(PlanTripInputSchema, z.object({ checkoutDate: z.string() })) },
  output: { schema: PlanTripOutputSchema },
  tools: [searchRealtimeTrainsFree],
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
      - **For travel within India:** Prioritize using the \`searchRealtimeTrainsFree\` tool. Get the station codes for origin and destination first, then call the tool.
      - **For international travel OR if train search returns no results:** Generate 2-3 realistic MOCK flight options. Do NOT use any tools for this. Make them look plausible.
      - **Combine all valid results** into a single 'bookingOptions' array.
  3. **Hotels:**
     - Generate 2-3 realistic MOCK hotel options unless 'accommodationType' is 'none'. Do not use tools.
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
    const MAX_TRIP_DURATION_FOR_DAILY_PLAN = 30;

    // 🛡️ Safety wrapper for LLM call
    try {
      console.log('[/src/ai/flows/plan-trip.ts] Calling prompt with input: ', input);
      if (input.tripDuration > MAX_TRIP_DURATION_FOR_DAILY_PLAN) {
          console.log(`Trip duration of ${input.tripDuration} is too long. Using high-level summary prompt.`);
          llmResponse = await longTripSummaryPrompt(input);
      } else {
          llmResponse = await prompt(input);
      }
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
                cost: `Approx. 10 ${input.currency}`,
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
            averageCost: `2 ${input.currency} per ride`,
            tip: "Buy a daily metro card for unlimited rides."
          },
          {
            type: "rideshare",
            provider: "Uber / Ola",
            details: "Available 24/7.",
            averageCost: `10-15 ${input.currency} per ride`,
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
