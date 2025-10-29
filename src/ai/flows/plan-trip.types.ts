
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
  accommodationType: z.enum(['hotel', 'hostel', 'vacation-rental', 'none']).describe('Preferred accommodation type. "none" means the user has their own arrangements.'),
  accommodationBudget: z.enum(['budget', 'moderate', 'luxury']).optional().describe('The budget for accommodation. This may be omitted if accommodationType is "none".'),
  planeClass: z.enum(['economy', 'premium-economy', 'business', 'first']).optional().describe('Preferred airline travel class.'),
  trainClass: z.enum(['sleeper', 'ac-3-tier', 'ac-2-tier', 'ac-first-class', 'chair-car']).optional().describe('Preferred train travel class.'),
  interests: z.string().describe('Detailed interests of the traveler(s), including food preferences (e.g., "local street food", "vegan restaurants", "fine dining").'),
});
export type PlanTripInput = z.infer<typeof PlanTripInputSchema>;

export const TransportSegmentSchema = z.object({
  mode: z.string().describe('e.g., Walk, Metro, Bus, Taxi, E-bike, Driving.'),
  duration: z.string().describe('e.g., "15 minutes".'),
  description: z.string().describe('Route description, e.g., "Via I-95 N".'),
  ecoFriendly: z.boolean().describe('Whether this is an eco-friendly travel option.'),
});
export type TransportSegment = z.infer<typeof TransportSegmentSchema>;


const ActivitySchema = z.object({
  time: z.string().describe('e.g., "09:00 AM".'),
  description: z.string().describe('e.g., "Visit the Santiago Bernabéu Stadium" or "Lunch".'),
  location: z.string().describe('The name and address of the location (e.g., "Paseo de la Castellana, 142" or "Sobrino de Botín, C. de Cuchilleros, 17").'),
  details: z.string().describe('More details about the activity, like booking info, why it was chosen, or tips.'),
  cost: z.string().optional().describe('Estimated cost for the activity in the desired currency, e.g., "€15" or "Free".'),
  transportToNext: TransportSegmentSchema.optional().nullable().describe('Transportation to the next activity.'),
});

const DayPlanSchema = z.object({
  day: z.number().describe('The day number of the itinerary (e.g., 1, 2, 3).'),
  title: z.string().describe('A catchy title for the day, e.g., "Historic Heart & Royal Splendor".'),
  summary: z.string().describe("A brief summary of the day's plan."),
  activities: z.array(ActivitySchema),
});

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

const HotelOptionSchema = z.object({
  name: z.string().describe("The name of the hotel."),
  style: z.string().describe("e.g., 'Luxury', 'Boutique', 'Budget-friendly'"),
  pricePerNight: z.string().describe("Estimated price per night in the requested currency."),
  rating: z.number().describe("e.g., 4.5"),
  bookingLink: z.string().url().describe("A mock URL to a hotel booking page."),
});

const LocalTransportOptionSchema = z.object({
    type: z.enum(['metro', 'bus', 'taxi', 'rideshare', 'bike', 'scooter', 'auto-rickshaw']).describe('Type of local transport.'),
    provider: z.string().describe('e.g., "City Metro", "Uber", "Lime"'),
    details: z.string().describe('e.g., "Line 10", "UberX", "Shared e-bike"'),
    averageCost: z.string().describe('e.g., "€2 per trip", "$10-15 per ride"'),
    tip: z.string().describe('A helpful tip about using this mode of transport in the destination.'),
});


export const PlanTripOutputSchema = z.object({
  tripTitle: z.string().describe('A creative and exciting title for the whole trip.'),
  journeyToHub: z.array(TransportSegmentSchema).optional().describe("A detailed, multi-modal plan to get from the user's origin to the nearest major transport hub (airport/train station). This should only be populated if the origin is not itself a major hub."),
  itinerary: z.array(DayPlanSchema),
  bookingOptions: z.array(BookingOptionSchema).describe("A list of mock booking options for the main journey from origin to destination."),
  hotelOptions: z.array(HotelOptionSchema).optional().describe("A list of 3-4 mock hotel suggestions based on user preferences."),
  localTransportOptions: z.array(LocalTransportOptionSchema).optional().describe("A list of recommended local transport options for getting around the destination city."),
});
export type PlanTripOutput = z.infer<typeof PlanTripOutputSchema>;
export type BookingOption = z.infer<typeof BookingOptionSchema>;
export type HotelOption = z.infer<typeof HotelOptionSchema>;
export type LocalTransportOption = z.infer<typeof LocalTransportOptionSchema>;
