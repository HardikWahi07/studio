
'use server';
/**
 * @fileOverview An AI agent for suggesting transport options for a trip.
 *
 * - suggestTransportOptions - A function that returns a list of booking options.
 */

import { ai } from '@/ai/genkit';
import { 
    SuggestTransportOptionsInputSchema, 
    SuggestTransportOptionsOutputSchema, 
    type SuggestTransportOptionsInput, 
    type SuggestTransportOptionsOutput 
} from './suggest-transport-options.types';


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
