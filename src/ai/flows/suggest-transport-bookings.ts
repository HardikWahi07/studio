
'use server';
/**
 * @fileOverview An AI agent for suggesting flight bookings.
 *
 * - suggestTransportBookings - A function that returns a list of flight booking options.
 * - SuggestTransportBookingsInput - The input type for the function.
 * - SuggestTransportBookingsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { searchRealtimeTrainsFree } from '../tools/search-trains-free';

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
    availability: z.enum(['Available', 'Waitlist', 'Sold Out', 'N/A', 'Unknown']).optional().describe('The real-time availability status for this option.'),
});

const JourneyLegSchema = z.object({
  leg: z.number().describe("The sequence number of this leg in the journey."),
  description: z.string().describe("A human-readable description of this leg of the journey, e.g., 'Train from Pune to Mumbai' or 'Taxi across Mumbai'"),
  options: z.array(BookingOptionSchema).describe("A list of transport options for this leg."),
});

export const SuggestTransportBookingsOutputSchema = z.object({
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
  tools: [searchRealtimeTrainsFree],
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}
  - **Plane Class:** {{{planeClass}}}
  - **Train Class:** {{{trainClass}}}

  **Your Task:**

  1.  **Analyze the Route:** Determine if this is a domestic Indian journey or an international one.
  2.  **Generate Options:**
      - **For travel within India:** First, try to use the \`searchRealtimeTrainsFree\` tool. You MUST find the station codes for the origin and destination cities before calling the tool.
      - **If no trains are found OR for international travel:** Generate 2-3 realistic MOCK flight options. Do NOT use any tools for this. Make them look plausible, with providers like 'IndiGo', 'Vistara', 'Air India' for domestic, and major international carriers for other routes.
  3.  **Format Output:** Structure the results as one or more journey legs. A direct trip will have one leg. A multi-step trip (e.g., taxi to station, then train) will have multiple legs. Place the options you generate into the 'options' array for the appropriate leg.
  
  **IMPORTANT:** Generate plausible-looking data for all fields, including provider, price, duration, and booking links (use example.com or official carrier sites).
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
        llmResponse = { output: null, history: [] }; 
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
