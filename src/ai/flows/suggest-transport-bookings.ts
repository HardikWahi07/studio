
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
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best transport options for a user's journey by creating valid, working deep-links to real booking websites.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}} (Format: YYYY-MM-DD)
  - **Currency:** {{{currency}}}

  **CRITICAL TASK: GENERATE VALID, RELIABLE BOOKING LINKS**

  You MUST generate a valid, URL-encoded \`bookingLink\` for every transport option. Follow these rules precisely:

  1.  **ANALYZE THE ROUTE (CRITICAL LOGIC):**
      - **Nearest Hubs:** First, determine the nearest major airport (IATA code) and railway station (station code) for both the origin and destination.
      - **Multi-leg Journeys:** If a direct flight or train is not plausible (e.g., Vapi to Shimla), you MUST create a multi-leg journey. For example: Leg 1 flight to the nearest airport, Leg 2 ground transport.

  2.  **GENERATE MOCK OPTIONS WITH SMART LINKS:**

      - **FLIGHTS:** The \`bookingLink\` MUST be a valid, URL-encoded Google Flights search URL.
        - **FORMAT:** \`https://www.google.com/travel/flights?q=flights%20from%20{ORIGIN_IATA}%20to%20{DESTINATION_IATA}%20on%20{YYYY-MM-DD}\`
        - **EXAMPLE:** For a flight from Mumbai (BOM) to Delhi (DEL) on 2025-12-20, the URL is: \`https://www.google.com/travel/flights?q=flights%20from%20BOM%20to%20DEL%20on%202025-12-20\`

      - **TRAINS:** The \`bookingLink\` MUST also be a valid, URL-encoded Google Flights search URL, which can handle train searches.
        - **FORMAT:** \`https://www.google.com/travel/flights?q=trains%20from%20{ORIGIN_STATION_CODE}%20to%20{DESTINATION_STATION_CODE}%20on%20{YYYY-MM-DD}\`
        - **EXAMPLE:** For a train from Vapi (VAPI) to Pune (PUNE) on 2025-12-20, the URL is: \`https://www.google.com/travel/flights?q=trains%20from%20VAPI%20to%20PUNE%20on%202025-12-20\`
        - Provide mock availability data ('Available', 'Waitlist', 'Sold Out').
      
      - **OTHER TRANSPORT (Bus, Taxi, etc.):** For other transport types where a direct booking link is not feasible, generate a reliable Google Search link that will help the user find booking options.
        - **FORMAT:** \`https://www.google.com/search?q={URL_ENCODED_QUERY}\`
        - **EXAMPLE:** For a bus from Pune to Mumbai, the query would be 'bus%20from%20Pune%20to%20Mumbai' and the URL would be \`https://www.google.com/search?q=bus%20from%20Pune%20to%20Mumbai\`

  3.  **FORMAT OUTPUT:** Structure the results into journey legs. A direct trip will have one leg. A multi-step trip will have multiple legs.
  
  Return a valid JSON object that strictly follows the output schema. NO spaces or invalid characters in URLs.
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
