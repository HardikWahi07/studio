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
      trainNumber: z.string().describe('The train number to check availability for.'),
      travelClass: z.string().describe('The class of travel to check (e.g., "3A", "SL", "2A").'),
    }),
    outputSchema: z.object({
      trains: z.array(z.object({
        trainName: z.string(),
        trainNumber: z.string(),
        departureTime: z.string(),
        arrivalTime: z.string(),
        travelClass: z.string().describe('e.g., "AC First Class (1A)", "Sleeper (SL)"'),
        availability: z.string().describe('The availability status, e.g., "AVAILABLE 100", "WL 7", "RAC 2"'),
        price: z.string(),
      }))
    }),
  },
  async (input) => {
    console.log(`[getTrainAvailability Tool] Checking availability for train ${input.trainNumber} from ${input.origin} to ${input.destination} on ${input.date}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[getTrainAvailability Tool] RAPIDAPI_KEY is not set. Returning empty array.");
        return { trains: [] };
    }

    try {
        const response = await fetch(`https://indian-railway-api.p.rapidapi.com/api/v1/seat/availability?class=${input.travelClass}&date=${input.date}&from=${input.origin}&quota=GN&to=${input.destination}&train=${input.trainNumber}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'indian-railway-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            console.error(`[getTrainAvailability Tool] API error: ${response.statusText}`);
            return { trains: [] };
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            return { trains: [] };
        }

        const availabilityData = data.data[0];

        return {
          trains: [{
              trainName: availabilityData.train_name,
              trainNumber: availabilityData.train_number,
              departureTime: availabilityData.from_sta,
              arrivalTime: availabilityData.to_sta,
              travelClass: availabilityData.class,
              availability: availabilityData.status,
              price: 'N/A' // This specific API doesn't return price, so we mark it as N/A
          }]
        };

    } catch (error) {
        console.error("[getTrainAvailability Tool] Failed to fetch availability:", error);
        return { trains: [] };
    }
  }
);
