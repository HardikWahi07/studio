
// src/ai/flows/generate-personalized-itineraries.ts
'use server';
/**
 * @fileOverview Generates personalized trip itineraries based on user preferences.
 *
 * - generatePersonalizedItinerary - A function that generates a personalized trip itinerary.
 * - GeneratePersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - GeneratePersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PlanTripOutputSchema, type PlanTripOutput } from './plan-trip.types';


const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip.'),
  budget: z.string().describe('The budget for the trip.'),
  interests: z.string().describe('The interests of the traveler.'),
});

export type GeneratePersonalizedItineraryInput = z.infer<
  typeof GeneratePersonalizedItineraryInputSchema
>;

// Use the same output schema as the main trip planner for consistency.
export type GeneratePersonalizedItineraryOutput = PlanTripOutput;


export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const generatePersonalizedItineraryPrompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  output: {schema: PlanTripOutputSchema},
  prompt: `You are an expert travel assistant. Generate a personalized, day-by-day trip itinerary based on the following information:

  - **Destination:** {{{destination}}}
  - **Budget:** {{{budget}}}
  - **Interests & Preferences:** {{{interests}}}

  Your Task:
  1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.
  2.  **Generate a Day-by-Day Itinerary:** Create a plan for a 3-day trip. For each day, create a detailed plan.
      - Each day needs a **title** and a brief **summary**.
      - For each activity, provide:
        - **Time:** A specific start time (e.g., "09:00 AM").
        - **Description:** A clear description of the activity (e.g., "Guided tour of the Louvre Museum").
        - **Location:** The address or name of the place.
        - **Cost:** An estimated cost for the activity (e.g., "€25", "$50", "Free").
        - **Details:** Practical tips, booking information, or why it's a great spot.
      - **CRITICAL: For activities like "Lunch," "Dinner," or "Coffee," you MUST suggest a specific, real business.** Base your suggestion on the user's interests.
      - **MANDATORY: Include Detailed Transportation:** Between each activity, you MUST add a 'transportToNext' segment with estimated travel times, mode of transport, and a route description.
  
  You MUST NOT suggest booking options, hotel options, or local transport options for this simplified itinerary. Return empty arrays for 'bookingOptions', 'hotelOptions', and 'localTransportOptions'.
  
  Produce the final output in the required JSON format.
  `,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: PlanTripOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedItineraryPrompt(input);
    if (!output) {
      throw new Error("AI model failed to generate a valid itinerary. The response was empty.");
    }
    // Ensure arrays are not null to prevent UI errors
    output.bookingOptions = [];
    output.hotelOptions = [];
    output.localTransportOptions = [];

    return output;
  }
);
