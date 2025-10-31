
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
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}

  **Your Task:**

  1.  **Analyze the Route:** First, determine if the route is domestic within India or international.
  2.  **Generate Options:**
      - **For travel within India:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for these mock trains MUST be a valid, pre-filled ixigo.com search URL. The date format for ixigo is DD-MM-YYYY.
      - **For ALL routes:** Generate 2-3 realistic MOCK flight options. The \`bookingLink\` for these mock flights MUST be a valid, pre-filled Google Flights URL. Format: \`https://www.google.com/flights?q=flights+from+ORIGIN+to+DESTINATION+on+YYYY-MM-DD\`
  3.  **Format Output:** Structure the results into a single journey leg. Combine both the mock train and flight options into the 'options' array for that leg. If the journey is not in India, only provide flight options.
  
  **IMPORTANT:** If the origin city does not have an airport (e.g., 'Vapi'), you must create a multi-leg journey.
   - **Leg 1:** Ground transport (taxi, bus) from the origin to the nearest major airport.
   - **Leg 2:** Flight options from that airport to the destination.
  
  Return a valid JSON object that strictly follows the output schema.
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
    // Call the LLM with the defined prompt
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
