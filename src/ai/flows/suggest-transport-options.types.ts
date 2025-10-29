/**
 * @fileOverview Types and schemas for the transport options suggestion flow.
 */
import { z } from 'zod';

export const BookingOptionSchema = z.object({
  type: z.enum(['flight', 'train', 'bus', 'driving']).describe('Type of transport.'),
  provider: z.string().describe('e.g., "Iberia", "Renfe", "Alsa", "Self-drive"'),
  details: z.string().describe('e.g., "Flight IB388, Non-stop" or "Via I-90 E"'),
  duration: z.string().describe('e.g., "2h 30m"'),
  price: z.string().describe('e.g., "€120"'),
  ecoFriendly: z.boolean().describe('Is this option eco-friendly?'),
  bookingLink: z.string().url().describe('A mock URL to a booking page.'),
});
export type BookingOption = z.infer<typeof BookingOptionSchema>;

export const HotelOptionSchema = z.object({
  name: z.string().describe("The name of the hotel."),
  style: z.string().describe("e.g., 'Luxury', 'Boutique', 'Budget-friendly'"),
  pricePerNight: z.string().describe("Estimated price per night in the requested currency."),
  rating: z.number().describe("e.g., 4.5"),
  bookingLink: z.string().url().describe("A mock URL to a hotel booking page."),
});
export type HotelOption = z.infer<typeof HotelOptionSchema>;

export const LocalTransportOptionSchema = z.object({
    type: z.enum(['metro', 'bus', 'taxi', 'rideshare', 'bike', 'scooter']).describe('Type of local transport.'),
    provider: z.string().describe('e.g., "City Metro", "Uber", "Lime"'),
    details: z.string().describe('e.g., "Line 10", "UberX", "Shared e-bike"'),
    averageCost: z.string().describe('e.g., "€2 per trip", "$10-15 per ride"'),
    tip: z.string().describe('A helpful tip about using this mode of transport in the destination.'),
});
export type LocalTransportOption = z.infer<typeof LocalTransportOptionSchema>;


export const SuggestTransportOptionsInputSchema = z.object({
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
