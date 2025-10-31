
'use server';
/**
 * @fileOverview An AI agent for suggesting transport bookings.
 *
 * - suggestTransportBookings - A function that returns a list of booking options.
 */

import { ai } from '@/ai/genkit';
import { 
    SuggestTransportBookingsInputSchema, 
    SuggestTransportBookingsOutputSchema,
    type SuggestTransportBookingsInput,
    type SuggestTransportBookingsOutput
} from './suggest-transport-bookings.types';
import { searchTrains } from '../tools/search-trains';


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
  tools: [searchTrains],
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}
  - **Plane Class:** {{{planeClass}}}
  - **Train Class:** {{{trainClass}}}

  **Your Task:**

  1.  **Analyze the Route:** First, determine if the origin city has a major airport. If it does not, you MUST create a multi-leg journey.
  2.  **Generate Options:**
      - **For travel within India:** Always try to use the \`searchTrains\` tool. Call the tool with the user's provided origin and destination city names.
      - **If the origin city (e.g., Vapi) does not have an airport:**
          - **Leg 1:** Create a journey leg for ground transport (e.g. Taxi, Bus) from the origin city to the NEAREST major airport (e.g., from Vapi to Mumbai Airport). Provide 1-2 mock options for this.
          - **Leg 2:** Create a second journey leg with 2-3 realistic MOCK flight options from that major airport to the final destination. Do NOT use tools for mock flights. The \`bookingLink\` for these mock flights MUST be a valid, pre-filled Google Flights URL.
      - **If the origin city has an airport OR for international travel:** Generate 2-3 realistic MOCK flight options for a single journey leg, with valid, pre-filled Google Flights URLs as booking links.
  3.  **Format Output:** Structure the results into one or more journey legs as appropriate. Place the options you generate into the 'options' array for the correct leg.
  
  **IMPORTANT:** Generate plausible-looking data for all fields, including provider, price, duration, and booking links.
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
