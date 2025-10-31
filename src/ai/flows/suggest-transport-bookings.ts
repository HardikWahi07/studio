
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
import { searchRealtimeTrainsFree } from '../tools/search-trains-free';


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
