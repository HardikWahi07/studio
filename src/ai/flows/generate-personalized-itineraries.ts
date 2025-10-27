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

const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip.'),
  budget: z.string().describe('The budget for the trip.'),
  interests: z.string().describe('The interests of the traveler.'),
});

export type GeneratePersonalizedItineraryInput = z.infer<
  typeof GeneratePersonalizedItineraryInputSchema
>;

const GeneratePersonalizedItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated trip itinerary.'),
});

export type GeneratePersonalizedItineraryOutput = z.infer<
  typeof GeneratePersonalizedItineraryOutputSchema
>;

export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const generatePersonalizedItineraryPrompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  output: {schema: GeneratePersonalizedItineraryOutputSchema},
  prompt: `You are an expert travel assistant. Generate a personalized trip itinerary based on the following information:\n\nDestination: {{{destination}}}\nBudget: {{{budget}}}\nInterests: {{{interests}}}\n\nItinerary:`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedItineraryPrompt(input);
    return output!;
  }
);
