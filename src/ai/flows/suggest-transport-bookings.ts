
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
      - **Flights:** First, determine if a direct flight is plausible between the origin and destination cities. For example, there are no direct commercial flights from Mumbai to Shimla.
      - **Trains:** Similarly, for trains, identify the nearest major railway stations for the origin and destination. For example, for a query from "Vapi to Lohegaon", the correct train route is Vapi (VAPI) to Pune Junction (PUNE), as Lohegaon is an area in Pune without a major station.
      - **If a direct route is not possible, you MUST create a multi-leg journey.** For example, Leg 1 could be a flight to the nearest major airport, and Leg 2 could be ground transport (taxi, bus) to the final destination.

  2.  **Generate Mock Options with Smart Links:**
      - **For travel within India:** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for these mock trains MUST be a valid, pre-filled ixigo.com search URL in the format \`https://www.ixigo.com/trains/search/{FROM_STATION_CODE}/{TO_STATION_CODE}/{DDMMYYYY}\`. **CRUCIAL:** To make the data realistic, the 'availability' field for these trains should sometimes be 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or even 'Sold Out'.
      - **For ALL routes:** Generate 2-3 realistic MOCK flight options. Flights are almost always available, so use 'Available' or 'N/A'. For peak seasons, add a note to the 'details' field like "Prices higher than usual". The \`bookingLink\` for these mock flights MUST be a valid, pre-filled, and properly URL-encoded Google Flights URL using the user's input.
      - **URL ENCODING (CRITICAL):** The generated \`bookingLink\` URLs MUST be properly encoded. There must be NO spaces in the URL. Replace all spaces in parameters with a '+' or '%20'.

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
