
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
    // You will need to use the API key you mentioned to make a real request.
    // The response below is MOCK DATA for demonstration purposes.
    //
    // Example:
    // const apiKey = process.env.YOUR_TRAIN_API_KEY;
    // const response = await fetch(`https://api.example-train-provider.com/search?from=${input.origin}&to=${input.destination}&date=${input.date}`, {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // const data = await response.json();
    // return transformApiDataToToolOutput(data);
    //
    
    // Returning mock data:
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
