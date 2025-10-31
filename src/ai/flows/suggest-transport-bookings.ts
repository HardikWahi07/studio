
'use server';
/**
 * @fileOverview An AI agent for suggesting transport bookings using smart deep links.
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
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey by creating smart, pre-filled URLs to real booking websites.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}

  **Your Task:**

  1.  **Analyze the Route:** First, determine if the route is domestic within India or international. Most importantly, check if a direct flight is plausible. For example, there are no direct commercial flights from Mumbai to Shimla.
  2.  **Generate Mock Options with Smart Links:**
      - **If a direct flight is not possible (e.g., Mumbai to Shimla):** You MUST create a multi-leg journey. Leg 1 should be a flight to the nearest major airport (e.g., Chandigarh - IXC), and Leg 2 should be ground transport (taxi, bus) to the final destination (Shimla).
      - **For travel within India:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for these mock trains MUST be a valid, pre-filled ixigo.com search URL. The date format for ixigo is DD-MM-YYYY. **CRUCIAL:** To make the data realistic, the 'availability' field for these trains should sometimes be 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or even 'Sold Out'.
      - **For ALL routes:** Generate 2-3 realistic MOCK flight options. Flights are almost always available, so do NOT use 'Sold Out'. Instead, for peak seasons, you can set availability to 'N/A' and add a note to the 'details' field like "Prices higher than usual". The \`bookingLink\` for these mock flights MUST be a valid, pre-filled Google Flights URL using the user's input.
      - **URL ENCODING (CRITICAL):** The generated \`bookingLink\` URLs MUST be properly encoded. There must be NO spaces in the URL. Replace all spaces in parameters with a '+' or '%20'. For example, 'lucknow, uttar pradesh' must become 'lucknow,+uttar+pradesh' or 'lucknow%2C%20uttar%20pradesh'.
  3.  **Format Output:** Structure the results into journey legs. If it's a direct trip, there will be one leg. If it's multi-step, there will be multiple legs.
  
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
    const { output } = await prompt(input);

    // Ensure the output is not null and conforms to the schema
    if (!output || !Array.isArray(output.journey)) {
      console.error("AI returned null or invalid output for transport bookings. Input was:", input);
      throw new Error("The AI model failed to generate valid booking suggestions.");
    }
    
    return output;
  }
);
