'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const searchRealtimeTrains = ai.defineTool(
  {
    name: 'searchRealtimeTrains',
    description: 'Searches for real-time train options between two cities in India.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey.'),
      destination: z.string().describe('The destination city for the train journey.'),
    }),
    outputSchema: z.object({
        trains: z.array(z.object({
            trainNumber: z.string(),
            trainName: z.string(),
            departureTime: z.string(),
            arrivalTime: z.string(),
            duration: z.string(),
            fare: z.string(),
            travelClass: z.string(),
        }))
    }),
  },
  async (input) => {
    console.log(`[searchRealtimeTrains Tool] Searching for trains from ${input.origin} to ${input.destination}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeTrains Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return { trains: [] };
    }

    try {
        const response = await fetch(`https://indian-railway-api.p.rapidapi.com/api/v1/trains/betweenStations?from=${input.origin}&to=${input.destination}&date=2024-12-01`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'indian-railway-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            console.error(`[searchRealtimeTrains Tool] API error: ${response.statusText}`);
            return { trains: [] };
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            return { trains: [] };
        }

        // The API provides many trains, let's take the first 4 for a concise list.
        const trains = data.data.slice(0, 4).map((train: any) => {
            // Find a class with a fare to display
            const availableClass = train.classes.find((c: any) => c.fare);
            return {
                trainNumber: train.train_number,
                trainName: train.train_name,
                departureTime: train.from_sta,
                arrivalTime: train.to_sta,
                duration: train.duration,
                fare: availableClass ? `₹${availableClass.fare}` : 'N/A',
                travelClass: availableClass ? availableClass.class_name : 'N/A'
            };
        });

        return { trains };

    } catch (error) {
        console.error("[searchRealtimeTrains Tool] Failed to fetch trains:", error);
        return { trains: [] };
    }
  }
);
