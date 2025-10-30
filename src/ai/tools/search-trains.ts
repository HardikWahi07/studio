
'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getStationCode } from './get-station-code';
import { format } from 'date-fns';

export const searchRealtimeTrains = ai.defineTool(
  {
    name: 'searchRealtimeTrains',
    description: 'Searches for real-time train options between two cities for travel within India. It can take city names as input.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey (e.g., "Mumbai", "Vapi").'),
      destination: z.string().describe('The destination city for the train journey (e.g., "Delhi", "Lucknow").'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The class of travel to check (e.g., "3A", "SL", "2A"). If not provided, a default will be used.'),
    }),
    outputSchema: z.object({
        trains: z.array(z.object({
            trainNumber: z.string(),
            trainName: z.string(),
            departureTime: z.string(),
            arrivalTime: z.string(),
            duration: z.string(),
            fare: z.string().optional(),
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
        const [originStationCode, destinationStationCode] = await Promise.all([
            getStationCode(input.origin),
            getStationCode(input.destination),
        ]);

        if (!originStationCode || !destinationStationCode) {
            console.error(`[searchRealtimeTrains Tool] Could not find station codes for ${input.origin} or ${input.destination}.`);
            return { trains: [] };
        }
        
        console.log(`[searchRealtimeTrains Tool] Found station codes: ${originStationCode} -> ${destinationStationCode}. Searching trains...`);
        const formattedDate = format(new Date(input.date), 'YYYY-MM-DD');

        const response = await fetch(`https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&dateOfJourney=${formattedDate}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeTrains Tool] API error fetching trains: ${response.statusText}`, errorBody);
            return { trains: [] };
        }
        
        const data = await response.json();
        
        if (!data.status || !data.data || data.data.length === 0) {
            console.log(`[searchRealtimeTrains Tool] No trains found from irctc1 API for ${originStationCode} to ${destinationStationCode} on ${formattedDate}.`);
            return { trains: [] };
        }

        // The API provides many trains, let's take the first 4 for a concise list.
        const trainsPromises = data.data.slice(0, 4).map(async (train: any) => {
            const travelClass = input.travelClass || train.available_classes[0] || "SL";
            
            let availability = 'N/A';
            try {
                 const availResponse = await fetch(`https://irctc1.p.rapidapi.com/api/v2/getFare?trainNo=${train.train_number}&fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}`, {
                     headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
                     }
                 });
                 if (availResponse.ok) {
                     const availData = await availResponse.json();
                     if (availData.status && availData.data) {
                         const classInfo = availData.data.find((c: any) => c.class_type === travelClass);
                         availability = classInfo ? classInfo.availability : 'Not Available';
                     } else {
                         availability = 'Not Available';
                     }
                 } else {
                     console.warn(`[searchRealtimeTrains Tool] Could not fetch availability for train ${train.train_number}, status: ${availResponse.status}`);
                     availability = 'Error';
                 }
            } catch (e) {
                 console.error(`[searchRealtimeTrains Tool] Exception when fetching availability for train ${train.train_number}`, e);
                 availability = 'Error Fetching';
            }

            return {
                trainNumber: train.train_number,
                trainName: train.train_name,
                departureTime: train.from_sta,
                arrivalTime: train.to_sta,
                duration: train.duration,
                fare: train.fare ? `₹${train.fare}` : undefined,
                travelClass: travelClass,
                availability: availability
            };
        });

        const trains = await Promise.all(trainsPromises);
        console.log(`[searchRealtimeTrains Tool] Found ${trains.length} trains.`);
        return { trains };

    } catch (error) {
        console.error("[searchRealtimeTrains Tool] Failed to fetch trains:", error);
        return { trains: [] };
    }
  }
);
