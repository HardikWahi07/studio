'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const SearchRealtimeTrainsFreeInputSchema = z.object({
  fromCity: z.string().describe('The name of the origin city, e.g., "Mumbai".'),
  toCity: z.string().describe('The name of the destination city, e.g., "Delhi".'),
  departureDate: z.string().describe('The date of departure in YYYY-MM-DD format.'),
});

const TrainOptionSchema = z.object({
  trainNumber: z.string(),
  trainName: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  availableClasses: z.array(z.string()),
  runsOn: z.object({
    sunday: z.boolean(),
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
  }),
});

const SearchRealtimeTrainsFreeOutputSchema = z.object({
  trains: z.array(TrainOptionSchema),
});

// Helper to get station code from city name
async function getStationCode(city: string): Promise<string | null> {
    const url = `https://indianrailapi.com/api/v2/StationCodeToName/apikey/d990263a1d99913990d9320875f2316a/name/${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`IndianRailAPI (Station Search) error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data: any = await response.json();
        // Find the most relevant station code, often the first one or one that matches common patterns
        if (data.ResponseCode === 200 && data.Stations && data.Stations.length > 0) {
            return data.Stations[0].StationCode; // Return the first result
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch station code from IndianRailAPI:', error);
        return null;
    }
}


async function getTrains(from: string, to: string, date: string): Promise<any> {
    const formattedDate = date.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
    const url = `https://indianrailapi.com/api/v2/TrainBetweenStation/apikey/d990263a1d99913990d9320875f2316a/from/${from}/to/${to}/date/${formattedDate}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`IndianRailAPI (Train Search) error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch from IndianRailAPI:', error);
        return null;
    }
}


export const searchRealtimeTrainsFree = ai.defineTool(
  {
    name: 'searchRealtimeTrainsFree',
    description: 'Searches for trains between two cities in India for a given date using a free public API.',
    inputSchema: SearchRealtimeTrainsFreeInputSchema,
    outputSchema: SearchRealtimeTrainsFreeOutputSchema,
  },
  async (input) => {
    console.log('[searchRealtimeTrainsFree] Searching trains for cities:', input);

    const fromStationCode = await getStationCode(input.fromCity);
    const toStationCode = await getStationCode(input.toCity);

    if (!fromStationCode || !toStationCode) {
        console.warn(`[searchRealtimeTrainsFree] Could not find station codes for ${input.fromCity} -> ${input.toCity}.`);
        return { trains: [] };
    }
    
    console.log(`[searchRealtimeTrainsFree] Found station codes: ${fromStationCode} -> ${toStationCode}`);
    const apiResult = await getTrains(fromStationCode, toStationCode, input.departureDate);

    if (!apiResult || apiResult.ResponseCode !== 200 || !apiResult.Trains) {
      console.warn('[searchRealtimeTrainsFree] No trains found or API error.');
      return { trains: [] };
    }

    const trains = apiResult.Trains.map((train: any) => ({
      trainNumber: train.TrainNo,
      trainName: train.TrainName,
      departureTime: train.DepartureTime,
      arrivalTime: train.ArrivalTime,
      duration: train.TravelTime,
      availableClasses: train.AvailableClasses,
      runsOn: {
        sunday: train.RunDays.includes('Sun'),
        monday: train.RunDays.includes('Mon'),
        tuesday: train.RunDays.includes('Tue'),
        wednesday: train.RunDays.includes('Wed'),
        thursday: train.RunDays.includes('Thu'),
        friday: train.RunDays.includes('Fri'),
        saturday: train.RunDays.includes('Sat'),
      },
    }));

    return { trains };
  }
);
