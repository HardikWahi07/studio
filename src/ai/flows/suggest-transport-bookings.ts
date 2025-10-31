
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

  1.  **Analyze the Route (CRITICAL LOGIC):**
      - **Flights & Trains:** First, determine the nearest major airport and railway station for both the origin and destination.
      - If a direct flight or train is not plausible (e.g., Vapi to Shimla), you MUST create a multi-leg journey. For example, Leg 1 could be a flight to the nearest major airport, and Leg 2 could be ground transport (taxi, bus) to the final destination.

  2.  **Generate Mock Options with Smart Links:**
      - **CRITICAL URL FORMATTING:** All \`bookingLink\` URLs MUST be properly URL-encoded. There must be NO spaces or invalid characters. Replace all spaces with a '+' plus sign.
      - **Flights:** Generate 2-3 realistic MOCK flight options. The \`bookingLink\` MUST be a valid, pre-filled Google Flights search URL. Example: \`https://www.google.com/flights?q=flights+from+BOM+to+DEL+on+2024-12-25\`
      - **Trains:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` MUST also be a valid, pre-filled Google search URL for that train route. Example: \`https://www.google.com/search?q=VAPI+to+PUNE+train+booking\`
      - **Train Availability:** For Indian trains, 'availability' should realistically be 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or 'Sold Out'. Flight availability can be 'Available' or 'N/A'.

  3.  **Format Output:** Structure the results into journey legs. A direct trip will have one leg. A multi-step trip will have multiple legs.
  
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
