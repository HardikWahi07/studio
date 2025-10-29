
'use server';
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
