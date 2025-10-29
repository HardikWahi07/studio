'use server';
/**
 * @fileOverview An AI agent for suggesting transport options for a trip.
 *
 * - suggestTransportOptions - A function that returns a list of booking options.
 * - SuggestTransportOptionsInput - The input type for the suggestTransportOptions function.
 * - SuggestTransportOptionsOutput - The return type for the suggestTransportOptions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BookingOptionSchema = z.object({
  type: z.enum(['flight', 'train', 'bus', 'driving']).describe('Type of transport.'),
  provider: z.string().describe('e.g., "Iberia", "Renfe", "Alsa", "Self-drive"'),
  details: z.string().describe('e.g., "Flight IB388, Non-stop" or "Via I-90 E"'),
  duration: z.string().describe('e.g., "2h 30m"'),
  price: z.string().describe('e.g., "€120"'),
  ecoFriendly: z.boolean().describe('Is this option eco-friendly?'),
  bookingLink: z.string().url().describe('A mock URL to a booking page.'),
});
export type BookingOption = z.infer<typeof BookingOptionSchema>;

const SuggestTransportOptionsInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  currency: z.string().describe('The currency for costs (e.g., USD, EUR, INR).'),
});
export type SuggestTransportOptionsInput = z.infer<typeof SuggestTransportOptionsInputSchema>;

export const SuggestTransportOptionsOutputSchema = z.object({
  best: BookingOptionSchema.optional().describe('The best overall option considering time and cost.'),
  cheapest: BookingOptionSchema.optional().describe('The most budget-friendly option.'),
  eco: BookingOptionSchema.optional().describe('The most environmentally friendly option.'),
  other: z.array(BookingOptionSchema).describe('A list of other viable transport options.'),
});
export type SuggestTransportOptionsOutput = z.infer<typeof SuggestTransportOptionsOutputSchema>;


export async function suggestTransportOptions(input: SuggestTransportOptionsInput): Promise<SuggestTransportOptionsOutput> {
  return suggestTransportOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransportPrompt',
  input: { schema: SuggestTransportOptionsInputSchema },
  output: { schema: SuggestTransportOptionsOutputSchema },
  prompt: `You are an expert travel booking agent. Your task is to find the best transport options for a journey.

  **Journey Details:**
  - **From:** {{{origin}}}
  - **To:** {{{destination}}}
  - **Currency for Costs:** {{{currency}}}

  **Your Task:**

  1.  **Generate Mock Booking Options:**
      - Create a list of realistic but *mock* booking options. Include a mix of flights, trains, and buses where appropriate for the distance.
      - For each option, provide a provider, details, duration, price (in the requested currency), and a fake booking URL.

  2.  **Categorize Options:**
      - **'best'**: Identify the option that offers the best balance of travel time and cost. This is often a non-stop flight on a reputable airline for long distances, or a high-speed train for medium distances.
      - **'cheapest'**: Identify the absolute cheapest option, which might be a budget airline with a layover or a long-distance bus.
      - **'eco'**: Identify the most environmentally friendly option. This is almost always a train, followed by a bus. Flights are the least eco-friendly.
      - **'other'**: Place any remaining viable options in this array.

  3. **Return in JSON format:** Ensure the output strictly follows the requested JSON schema. Do not recommend the same provider for multiple categories unless there are no other options.
  `,
});

const suggestTransportOptionsFlow = ai.defineFlow(
  {
    name: 'suggestTransportOptionsFlow',
    inputSchema: SuggestTransportOptionsInputSchema,
    outputSchema: SuggestTransportOptionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
