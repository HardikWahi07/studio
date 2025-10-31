
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

  **Your Task:**

  1.  **Analyze the Route:** First, determine if the origin and destination cities are within India.
  2.  **Generate Options:**
      - **For travel within India:** You MUST call the \`searchTrains\` tool with the user's provided origin and destination city names to get real train data.
      - **For ALL routes:** Also generate 2-3 realistic MOCK flight options. Do NOT use tools for mock flights. The \`bookingLink\` for these mock flights MUST be a valid, pre-filled Google Flights URL. Format: \`https://www.google.com/flights?q=flights+from+ORIGIN+to+DESTINATION+on+YYYY-MM-DD\`
  3.  **Format Output:** Structure the results into a single journey leg. Combine both the real train options and the mock flight options into the 'options' array for that leg.
  
  **IMPORTANT:** If the \`searchTrains\` tool returns no results, proceed with generating only the mock flight options. Do not return an empty journey unless both fail.
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
