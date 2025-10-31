'use server';
/**
 * @fileOverview An AI agent for suggesting transport bookings, capable of multi-leg journeys.
 *
 * - suggestTransportBookings - A function that returns a list of booking options.
 * - SuggestTransportBookingsInput - The input type for the function.
 * - SuggestTransportBookingsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchRealtimeFlights } from '../tools/search-flights';
import { searchRealtimeTrains } from '../tools/search-trains';
import { getJourneyToHub } from '../tools/get-journey-to-hub';

// Define Zod schemas for input and output
const SuggestTransportBookingsInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The date of departure in YYYY-MM-DD format.'),
  currency: z.string().describe('The currency for costs (e.g., USD, EUR, INR).'),
  planeClass: z.string().optional().describe('Preferred airline travel class (e.g., "economy", "business").'),
  trainClass: z.string().optional().describe('Preferred train travel class (e.g., "SL" for Sleeper, "3A" for AC 3 Tier).'),
});
export type SuggestTransportBookingsInput = z.infer<typeof SuggestTransportBookingsInputSchema>;


const BookingOptionSchema = z.object({
    type: z.enum(['flight', 'train', 'bus', 'driving', 'rickshaw', 'taxi', 'walk']).describe('Type of transport.'),
    provider: z.string().describe('e.g., "Iberia", "Renfe", "Alsa", "Self-drive", "IRCTC", "Local Rickshaw"'),
    details: z.string().describe('e.g., "Dep: 08:30, Arr: 11:00, Flight IB388" or "CSMT to Bandra Terminus"'),
    duration: z.string().describe('e.g., "2h 30m"'),
    price: z.string().describe('e.g., "€120"'),
    bookingLink: z.string().url().describe('A mock URL to a booking page.'),
    ecoFriendly: z.boolean().describe('Is this option eco-friendly?'),
    availability: z.enum(['Available', 'Waitlist', 'Sold Out', 'N/A']).optional().describe('The real-time availability status for this option.'),
});

const JourneyLegSchema = z.object({
  leg: z.number().describe("The sequence number of this leg in the journey."),
  description: z.string().describe("A human-readable description of this leg of the journey, e.g., 'Train from Pune to Mumbai' or 'Taxi across Mumbai'"),
  options: z.array(BookingOptionSchema).describe("A list of transport options for this leg."),
});

const SuggestTransportBookingsOutputSchema = z.object({
  journey: z.array(JourneyLegSchema).describe("An array of journey legs. A direct trip will have one leg. A multi-step trip will have multiple legs."),
});
export type SuggestTransportBookingsOutput = z.infer<typeof SuggestTransportBookingsOutputSchema>;


/**
 * Public function to be called by the frontend to get transport suggestions.
 * @param input The details of the journey.
 * @returns A promise that resolves to the suggested booking options.
 */
export async function suggestTransportBookings(input: SuggestTransportBookingsInput): Promise<SuggestTransportBookingsOutput> {
  return suggestTransportBookingsFlow(input);
}

// Define the Genkit prompt for the AI
const prompt = ai.definePrompt({
  name: 'suggestTransportBookingsPrompt',
  input: { schema: SuggestTransportBookingsInputSchema },
  output: { schema: SuggestTransportBookingsOutputSchema },
  tools: [searchRealtimeFlights, searchRealtimeTrains, getJourneyToHub],
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}
  - **Plane Class:** {{{planeClass}}}
  - **Train Class:** {{{trainClass}}}

  **Your Task:**

  1.  **Direct Route First:** First, attempt to find direct transport options from the exact 'origin' to the exact 'destination'. 
      - If the journey is within India, prioritize using the 'searchRealtimeTrains' tool.
      - For all other destinations, prioritize using the 'searchRealtimeFlights' tool.

  2.  **MANDATORY FALLBACK TO HUBS:** If the direct searches from step 1 (for both trains and flights) return NO available options or an empty array, YOU MUST proceed to this step. This is not optional.
      a.  **Identify Hubs:** Identify the nearest major transport hub (e.g., a large international airport or central train station) for BOTH the 'origin' and the 'destination'. For example, for a journey from "Vapi, India" to "Pune, India", you should recognize that Vapi doesn't have an airport and identify "Mumbai, India" or "Surat, India" as the nearest major airport hubs.
      b.  **Construct Multi-Leg Journey:**
          i.  **First Leg:** Find options for the journey from the original 'origin' to the origin hub. You can use 'searchRealtimeTrains' or 'getJourneyToHub' for this (e.g., Vapi to Mumbai). This will be Leg 1.
          ii. **Main Leg:** Find flight or train options from the origin hub to the destination hub (e.g., Mumbai to Pune). This will be Leg 2.
          iii. **Final Leg (if needed):** Find options from the destination hub to the original 'destination'. This will be Leg 3.
      c.  **Combine Results:** Structure the final output as a 'journey' array containing multiple 'leg' objects.

  3.  **Output Structure:**
      - The final output MUST be a 'journey' array.
      - A direct trip will have one leg. A trip requiring travel via a hub will have multiple legs.
      - Each leg must have a description (e.g., "Train from Vapi to Mumbai") and a list of booking options.

  **IMPORTANT:** Do not give up if a direct search fails. The multi-leg hub search is a required fallback step.
  `,
});

// Define the main Genkit flow
const suggestTransportBookingsFlow = ai.defineFlow(
  {
    name: 'suggestTransportBookingsFlow',
    inputSchema: SuggestTransportBookingsInputSchema,
    outputSchema: SuggestTransportBookingsOutputSchema,
  },
  async (input) => {
    // Call the LLM with the defined prompt and tools
    let llmResponse;
    try {
        console.log("[suggestTransportBookingsFlow] Calling prompt with input:", input);
        llmResponse = await prompt(input);
    } catch (err) {
        console.error("❌ LLM prompt failed in suggestTransportBookingsFlow:", err);
        llmResponse = { output: null }; 
    }
    
    const output = llmResponse?.output;

    // Ensure the output is not null and conforms to the schema
    if (!output || !Array.isArray(output.journey)) {
      console.warn("AI returned null or invalid output for transport bookings. Returning empty journey.");
      return { journey: [] };
    }
    
    return output;
  }
);
