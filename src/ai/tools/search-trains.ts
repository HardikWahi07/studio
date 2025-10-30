'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getStationCode } from './get-station-code';


export const searchRealtimeTrains = ai.defineTool(
  {
    name: 'searchRealtimeTrains',
    description: 'Searches for real-time train options between two cities. This tool is for travel within India. It can take city names as input.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey (e.g., "Mumbai", "Vapi").'),
      destination: z.string().describe('The destination city for the train journey (e.g., "Delhi", "Lucknow").'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
      travelClass: z.string().describe('The class of travel to check (e.g., "3A", "SL", "2A").'),
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
            availability: z.string().describe('The availability status, e.g., "AVAILABLE 100", "WL 7", "RAC 2"'),
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
        // First, get the station codes for the origin and destination
        const [originStationCode, destinationStationCode] = await Promise.all([
            getStationCode(input.origin),
            getStationCode(input.destination),
        ]);

        if (!originStationCode || !destinationStationCode) {
            console.error(`[searchRealtimeTrains Tool] Could not find station codes for ${input.origin} or ${input.destination}.`);
            return { trains: [] };
        }
        
        console.log(`[searchRealtimeTrains Tool] Found station codes: ${originStationCode} -> ${destinationStationCode}`);

        const response = await fetch(`https://indian-railway-api.p.rapidapi.com/api/v1/trains/betweenStations?from=${originStationCode}&to=${destinationStationCode}&date=${input.date}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'indian-railway-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeTrains Tool] API error fetching trains: ${response.statusText}`, errorBody);
            return { trains: [] };
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log(`[searchRealtimeTrains Tool] No trains found from API for ${originStationCode} to ${destinationStationCode} on ${input.date}.`);
            return { trains: [] };
        }

        // The API provides many trains, let's take the first 4 for a concise list.
        const trains = data.data.slice(0, 4).map(async (train: any) => {
            // Find a class with a fare to display
            const availableClass = train.classes.find((c: any) => c.class_code === input.travelClass && c.fare);

            let availability = 'N/A';
             if (availableClass) {
                 try {
                     const availResponse = await fetch(`https://indian-railway-api.p.rapidapi.com/api/v1/seat/availability?class=${availableClass.class_code}&date=${input.date}&from=${originStationCode}&quota=GN&to=${destinationStationCode}&train=${train.train_number}`, {
                         headers: {
                            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                            'X-RapidAPI-Host': 'indian-railway-api.p.rapidapi.com'
                         }
                     });
                     if (availResponse.ok) {
                         const availData = await availResponse.json();
                         if (availData.data.length > 0) {
                             availability = availData.data[0].status;
                         } else {
                             availability = 'Not Available'
                         }
                     } else {
                         console.warn(`[searchRealtimeTrains Tool] Could not fetch availability for train ${train.train_number}, status: ${availResponse.status}`);
                         availability = 'Error';
                     }
                 } catch (e) {
                     console.error(`[searchRealtimeTrains Tool] Exception when fetching availability for train ${train.train_number}`, e);
                 }
             }

            return {
                trainNumber: train.train_number,
                trainName: train.train_name,
                departureTime: train.from_sta,
                arrivalTime: train.to_sta,
                duration: train.duration,
                fare: availableClass ? `₹${availableClass.fare}` : 'N/A',
                travelClass: availableClass ? availableClass.class_name : 'N/A',
                availability: availability
            };
        });

        return { trains: await Promise.all(trains) };

    } catch (error) {
        console.error("[searchRealtimeTrains Tool] Failed to fetch trains:", error);
        return { trains: [] };
    }
  }
);
