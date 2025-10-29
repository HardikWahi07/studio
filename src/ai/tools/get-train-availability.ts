'use server';
/**
 * @fileOverview A tool for fetching real-time train availability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const getTrainAvailability = ai.defineTool(
  {
    name: 'getTrainAvailability',
    description: 'Returns real-time availability for trains between two locations on a given date. Used to check if trains are available, waitlisted, or sold out.',
    inputSchema: z.object({
      origin: z.string().describe('The starting station or city.'),
      destination: z.string().describe('The destination station or city.'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
    }),
    outputSchema: z.object({
        trains: z.array(z.object({
            trainName: z.string(),
            trainNumber: z.string(),
            departureTime: z.string(),
            arrivalTime: z.string(),
            travelClass: z.string().describe('e.g., "AC First Class (1A)", "Sleeper (SL)"'),
            availability: z.enum(['Available', 'Waitlist', 'Sold Out']),
            price: z.string(),
        }))
    }),
  },
  async (input) => {
    console.log(`[getTrainAvailability Tool] Searching for trains from ${input.origin} to ${input.destination} on ${input.date}`);
    
    //
    // 🚨 DEVELOPER ACTION REQUIRED 🚨
    // This is where you would integrate with a real train API (e.g., IRCTC, RailYatri).
    // The response below is MOCK DATA for demonstration purposes.
    //
    
    // Returning more realistic mock data for a Pune to Lucknow route:
    if (input.origin.toLowerCase().includes('pune') && input.destination.toLowerCase().includes('lucknow')) {
      return {
        trains: [
          {
            trainName: 'Pune-Lucknow Express',
            trainNumber: '12103',
            departureTime: '10:45',
            arrivalTime: '13:15',
            travelClass: 'AC 2 Tier (2A)',
            availability: 'Available',
            price: '₹2,500'
          },
          {
            trainName: 'Pune-Lucknow Express',
            trainNumber: '12103',
            departureTime: '10:45',
            arrivalTime: '13:15',
            travelClass: 'Sleeper (SL)',
            availability: 'Waitlist',
            price: '₹650'
          },
          {
            trainName: 'Gorakhpur Express',
            trainNumber: '15030',
            departureTime: '17:30',
            arrivalTime: '20:50',
            travelClass: 'AC 3 Tier (3A)',
            availability: 'Available',
            price: '₹1,800'
          },
           {
            trainName: 'Yesvantpur-Lucknow SF',
            trainNumber: '22683',
            departureTime: '05:15',
            arrivalTime: '08:40',
            travelClass: 'AC 2 Tier (2A)',
            availability: 'Sold Out',
            price: '₹2,600'
          },
        ],
      };
    }

    // Default mock data for other routes
    return {
      trains: [
        {
          trainName: 'Rajdhani Express',
          trainNumber: '12301',
          departureTime: '17:00',
          arrivalTime: '09:55',
          travelClass: 'AC First Class (1A)',
          availability: 'Available',
          price: '₹4,800'
        },
        {
          trainName: 'Duronto Express',
          trainNumber: '12259',
          departureTime: '20:00',
          arrivalTime: '15:55',
          travelClass: 'AC 2 Tier (2A)',
          availability: 'Waitlist',
          price: '₹2,900'
        },
        {
            trainName: 'Sampark Kranti',
            trainNumber: '12907',
            departureTime: '21:30',
            arrivalTime: '18:45',
            travelClass: 'Sleeper (SL)',
            availability: 'Available',
            price: '₹850'
        },
      ],
    };
  }
);
