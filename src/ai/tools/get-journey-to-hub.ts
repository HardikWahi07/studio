'use server';
/**
 * @fileOverview A tool for suggesting transport options within a hub city.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getJourneyToHub = ai.defineTool(
  {
    name: 'getJourneyToHub',
    description: 'Suggests how to travel between two points within a single large city, like from an airport to a train station.',
    inputSchema: z.object({
      hubCity: z.string().describe('The city where the travel occurs, e.g., "Mumbai".'),
      originPoint: z.string().describe('The starting point within the city, e.g., "Chhatrapati Shivaji Maharaj International Airport".'),
      destinationPoint: z.string().describe('The ending point within the city, e.g., "Bandra Terminus".'),
      currency: z.string().describe('The desired currency for the fares (e.g., USD, EUR, INR).')
    }),
    outputSchema: z.array(z.object({
        type: z.enum(['taxi', 'rickshaw', 'bus', 'walk']),
        provider: z.string(),
        details: z.string(),
        duration: z.string(),
        price: z.string(),
        bookingLink: z.string().url(),
        ecoFriendly: z.boolean(),
        availability: z.literal('Available'),
    })),
  },
  async (input) => {
    // This is a mock implementation. A real implementation would use a service like Google Maps API.
    console.log(`[getJourneyToHub Tool] Planning journey within ${input.hubCity} from ${input.originPoint} to ${input.destinationPoint}`);

    const options = [
        {
            type: 'taxi' as const,
            provider: 'Local Taxi',
            details: 'Pre-paid or metered taxi',
            duration: '45-60 min',
            price: `${input.currency} 400`,
            bookingLink: 'https://www.example.com/book-taxi',
            ecoFriendly: false,
            availability: 'Available' as const,
        },
        {
            type: 'rickshaw' as const,
            provider: 'Auto Rickshaw',
            details: 'Metered auto-rickshaw',
            duration: '50-70 min',
            price: `${input.currency} 250`,
            bookingLink: 'https://www.example.com/book-rickshaw',
            ecoFriendly: false,
            availability: 'Available' as const,
        },
    ];

    return options;
  }
);
