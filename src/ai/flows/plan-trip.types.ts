import { z } from 'zod';

export const PlanTripInputSchema = z.object({
  origin: z.string().describe('The starting point of the journey.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The date of departure.'),
  tripDuration: z.number().describe('The duration of the trip in days.'),
  travelers: z.number().describe('The number of people traveling.'),
  currency: z.string().describe('The currency for costs (e.g., USD, EUR, INR).'),
  tripPace: z.enum(['relaxed', 'moderate', 'fast-paced']).describe('The desired pace of the trip.'),
  travelStyle: z.enum(['solo', 'couple', 'family', 'group']).describe('The style of travel.'),
  accommodationType: z.enum(['hotel', 'hostel', 'vacation-rental']).describe('Preferred accommodation type.'),
  interests: z.string().describe('Detailed interests of the traveler(s).'),
});
export type PlanTripInput = z.infer<typeof PlanTripInputSchema>;

const TransportSegmentSchema = z.object({
  mode: z.string().describe('e.g., Walk, Metro, Bus, Taxi, E-bike.'),
  duration: z.string().describe('e.g., "15 minutes".'),
  description: z.string().describe('Route description, e.g., "Metro Line 10 to Plaza de España".'),
  ecoFriendly: z.boolean().describe('Whether this is an eco-friendly travel option.'),
});
export type TransportSegment = z.infer<typeof TransportSegmentSchema>;


const ActivitySchema = z.object({
  time: z.string().describe('e.g., "09:00 AM".'),
  description: z.string().describe('e.g., "Visit the Santiago Bernabéu Stadium".'),
  location: z.string().describe('e.g., "Paseo de la Castellana, 142".'),
  details: z.string().describe('More details about the activity, like booking info or tips.'),
  transportToNext: TransportSegmentSchema.optional().describe('Transportation to the next activity.'),
});

const DayPlanSchema = z.object({
  day: z.number().describe('The day number of the itinerary (e.g., 1, 2, 3).'),
  title: z.string().describe('A catchy title for the day, e.g., "Historic Heart & Royal Splendor".'),
  summary: z.string().describe("A brief summary of the day's plan."),
  activities: z.array(ActivitySchema),
});

const BookingOptionSchema = z.object({
    type: z.enum(['flight', 'train', 'bus']).describe('Type of transport.'),
    provider: z.string().describe('e.g., "Iberia", "Renfe", "Alsa"'),
    details: z.string().describe('e.g., "Flight IB388, Non-stop"'),
    duration: z.string().describe('e.g., "2h 30m"'),
    price: z.string().describe('e.g., "€120"'),
    ecoFriendly: z.boolean().describe('Is this option eco-friendly?'),
    bookingLink: z.string().url().describe('A mock URL to a booking page.'),
});

export const PlanTripOutputSchema = z.object({
  tripTitle: z.string().describe('A creative and exciting title for the whole trip.'),
  journeyToHub: z.array(TransportSegmentSchema).optional().describe("A detailed, multi-modal plan to get from the user's origin to the nearest major transport hub (airport/train station). This should only be populated if the origin is not itself a major hub."),
  itinerary: z.array(DayPlanSchema),
  bookingOptions: z.array(BookingOptionSchema).describe("A list of mock booking options for the main journey from origin to destination."),
});
export type PlanTripOutput = z.infer<typeof PlanTripOutputSchema>;
export type BookingOption = z.infer<typeof BookingOptionSchema>;
