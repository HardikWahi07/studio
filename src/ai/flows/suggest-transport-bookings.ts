
'use server';
/**
 * @fileOverview An AI agent for suggesting transport bookings (flights and trains).
 *
 * - suggestTransportBookings - A function that returns a list of booking options.
 * - SuggestTransportBookingsInput - The input type for the function.
 * - SuggestTransportBookingsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchRealtimeFlights } from '../tools/search-flights';
import { searchRealtimeTrains } from '../tools/search-trains';

// Define Zod schemas for input and output
const SuggestTransportBookingsInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The date of departure in YYYY-MM-DD format.'),
  currency: z.string().describe('The currency for costs (e.g., USD, EUR, INR).'),
});
export type SuggestTransportBookingsInput = z.infer<typeof SuggestTransportBookingsInputSchema>;


const BookingOptionSchema = z.object({
    type: z.enum(['flight', 'train', 'bus', 'driving']).describe('Type of transport.'),
    provider: z.string().describe('e.g., "Iberia", "Renfe", "Alsa", "Self-drive", "IRCTC"'),
    details: z.string().describe('e.g., "Dep: 08:30, Arr: 11:00, Flight IB388" or "Dep: 14:00, Arr: 18:30, AC First Class"'),
    duration: z.string().describe('e.g., "2h 30m"'),
    price: z.string().describe('e.g., "€120"'),
    ecoFriendly: z.boolean().describe('Is this option eco-friendly?'),
    bookingLink: z.string().url().describe('A mock URL to a booking page.'),
    availability: z.enum(['Available', 'Waitlist', 'Sold Out', 'N/A']).optional().describe('The real-time availability status for this option.'),
});

const SuggestTransportBookingsOutputSchema = z.object({
  bookingOptions: z.array(BookingOptionSchema).describe("A list of booking options for the journey from origin to destination."),
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
  tools: [searchRealtimeFlights, searchRealtimeTrains],
  prompt: `You are an intelligent travel booking assistant. Your task is to find the best flight and train options for a user's journey.

  **User's Request:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **On:** {{{departureDate}}}
  - **Currency:** {{{currency}}}

  **Your Task:**
  1.  **Prioritize Trains for Indian Travel:** If the origin or destination seems to be in India (e.g., "Mumbai", "Vapi", "Delhi"), you MUST use the \`searchRealtimeTrains\` tool first.
  2.  **Fallback to Flights:** After searching for trains, if the tool returns no trains OR if all returned trains have an availability status that is NOT 'Available' (e.g., they are all 'Waitlist', 'Not Available', 'REGRET'), you MUST then also use the \`searchRealtimeFlights\` tool as a fallback.
  3.  **Use Flights for Other Routes:** For all non-Indian routes, use the \`searchRealtimeFlights\` tool.
  4.  **Combine and Return Results:** Consolidate the findings from the tools into a single list of booking options, showing both train and flight options if applicable.

  Return the results in the specified JSON format.
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
        llmResponse = await prompt(input);
    } catch (err) {
        console.error("❌ LLM prompt failed in suggestTransportBookingsFlow:", err);
        llmResponse = { output: null }; 
    }
    
    const output = llmResponse?.output;

    // Ensure the output is not null and conforms to the schema
    if (!output || !Array.isArray(output.bookingOptions)) {
      console.warn("AI returned null or invalid output for transport bookings. Returning empty array.");
      return { bookingOptions: [] };
    }
    
    return output;
  }
);
