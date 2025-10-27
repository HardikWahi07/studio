
import { z } from 'zod';

export const PlanTripInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The date of departure.'),
  travelers: z.number().describe('The number of people traveling.'),
  currency: z.string().describe('The currency to be used for all costs (e.g., USD, EUR, INR).'),
});
export type PlanTripInput = z.infer<typeof PlanTripInputSchema>;

export const HotelSchema = z.object({
    name: z.string().describe('Name of the hotel.'),
    location: z.string().describe('City of the hotel.'),
    rating: z.number(),
    reviews: z.string(),
    pricePerNight: z.string().describe('Price per night including currency symbol/code, e.g., ₹8,000 or $100.'),
    recommendationType: z.enum(["Luxury", "Budget", "Value"]).describe("The type of hotel recommendation."),
});
export type Hotel = z.infer<typeof HotelSchema>;

export const TransportOptionSchema = z.object({
  mode: z.string().describe('Transport mode (e.g., Flight, Train, Bus).'),
  duration: z.string(),
  cost: z.string().describe('Cost including currency symbol/code, e.g., ₹12,000 or $150.'),
  carbonValue: z.number().min(1).max(3).describe('An integer from 1 (low) to 3 (high).'),
  recommendation: z.string().optional(),
});
export type TransportOption = z.infer<typeof TransportOptionSchema>;

export const EcoMixSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  cost: z.string().describe('Cost including currency symbol/code, e.g., ₹12,000 or $150.'),
  carbonValue: z.number().min(1).max(3),
});
export type EcoMix = z.infer<typeof EcoMixSchema>;


export const PlanTripOutputSchema = z.object({
  ecoMix: EcoMixSchema.optional(),
  transportOptions: z.array(TransportOptionSchema),
  recommendedStayLuxury: HotelSchema.optional(),
  recommendedStayBudget: HotelSchema.optional(),
  recommendedStayValue: HotelSchema.optional(),
});
export type PlanTripOutput = z.infer<typeof PlanTripOutputSchema>;
