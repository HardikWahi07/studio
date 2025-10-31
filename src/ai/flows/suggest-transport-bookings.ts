
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
      - **Nearest Hubs:** First, determine the nearest major airport (IATA code) and railway station (station code) for both the origin and destination.
      - **Multi-leg Journeys:** If a direct flight or train is not plausible (e.g., Vapi to Shimla), you MUST create a multi-leg journey. For example: Leg 1 flight to the nearest airport, Leg 2 ground transport.

  2.  **Generate Mock Options with Smart Links (CRITICAL URL FORMATTING):**
      - **URL ENCODING:** All \`bookingLink\` URLs MUST be properly URL-encoded. There must be NO spaces or invalid characters.
      - **FLIGHTS:** Generate 2-3 realistic MOCK flight options. The \`bookingLink\` MUST be a valid, URL-encoded Google Flights search URL in the format: \`https://www.google.com/travel/flights?q=flights+from+{ORIGIN_IATA}+to+{DESTINATION_IATA}+on+{YYYY-MM-DD}\`.
      - **TRAINS (India):** Generate 2-3 realistic MOCK train options. The \`bookingLink\` for Indian trains MUST be \`https://www.irctc.co.in/nget/train-search\`. Do NOT add any parameters. Availability must be realistic: 'Available', 'Waitlist' (e.g., 'GNWL28/WL15'), or 'Sold Out'.
      
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
    const flowInput = { ...input };

    const { output } = await prompt(flowInput);

    // Ensure the output is not null and conforms to the schema
    if (!output || !Array.isArray(output.journey)) {
      console.error("AI returned null or invalid output for transport bookings. Input was:", input);
      throw new Error("The AI model failed to generate valid booking suggestions.");
    }
    
    return output;
  }
);
