
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import { format } from 'date-fns';

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
  availability: z.string().describe("e.g., 'Available' or 'Waitlist'"),
  bookingLink: z.string().url().describe("A direct link to book the train on IRCTC."),
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
        if (data.ResponseCode === 200 && data.Stations && data.Stations.length > 0) {
            return data.Stations[0].StationCode;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch station code from IndianRailAPI:', error);
        return null;
    }
}

async function getTrains(from: string, to: string, date: string) {
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

async function checkAvailability(trainNo: string, fromStation: string, toStation: string, date: string, classCode: string) {
    const formattedDate = format(new Date(date), 'dd-MM-yyyy');
    const url = `https://irctc1.p.rapidapi.com/api/v2/checkSeatAvailability?trainNo=${trainNo}&fromStationCode=${fromStation}&toStationCode=${toStation}&date=${formattedDate}&classType=${classCode}&quota=GN`;
    try {
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': '46face3ed4msh693153c8c95ba3bp1a0494jsnb39fe285d488',
                'x-rapidapi-host': 'irctc1.p.rapidapi.com',
            }
        });
        if (!response.ok) return "Unknown";
        const data: any = await response.json();
        return data?.data?.[0]?.status || "Unknown";
    } catch (error) {
        console.error(`Failed to fetch availability for train ${trainNo}:`, error);
        return "Unknown";
    }
}

export const searchRealtimeTrainsFree = ai.defineTool(
  {
    name: 'searchRealtimeTrainsFree',
    description: 'Searches for trains between two cities in India for a given date using a free public API, and checks their availability.',
    inputSchema: SearchRealtimeTrainsFreeInputSchema,
    outputSchema: SearchRealtimeTrainsFreeOutputSchema,
  },
  async (input) => {
    console.log('[searchRealtimeTrainsFree] Searching trains for cities:', input);

    const fromStationCode = await getStationCode(input.fromCity);
    const toStationCode = await getStationCode(input.toCity);

    if (!fromStationCode || !toStationCode) {
        console.warn(`[searchRealtimeTrainsFree] Could not find station codes for ${input.fromCity} -> ${toStationCode}.`);
        return { trains: [] };
    }
    
    console.log(`[searchRealtimeTrainsFree] Found station codes: ${fromStationCode} -> ${toStationCode}`);
    const apiResult = await getTrains(fromStationCode, toStationCode, input.departureDate);

    if (!apiResult || apiResult.ResponseCode !== 200 || !apiResult.Trains) {
      console.warn('[searchRealtimeTrainsFree] No trains found or API error.');
      return { trains: [] };
    }

    const trains = await Promise.all(apiResult.Trains.map(async (train: any) => {
      // Check availability for the first available class
      const firstClass = train.AvailableClasses?.[0];
      const availability = firstClass ? await checkAvailability(train.TrainNo, fromStationCode, toStationCode, input.departureDate, firstClass) : "Unknown";
      
      const formattedDate = format(new Date(input.departureDate), 'dd-MM-yyyy');

      // Construct a more specific booking link
      const bookingLink = `https://www.irctc.co.in/nget/train-search?trainNo=${train.TrainNo}&from=${fromStationCode}&to=${toStationCode}&date=${formattedDate}`;

      return {
        trainNumber: train.TrainNo,
        trainName: train.TrainName,
        departureTime: train.DepartureTime,
        arrivalTime: train.ArrivalTime,
        duration: train.TravelTime,
        availableClasses: train.AvailableClasses,
        availability: availability.includes('AVAILABLE') ? 'Available' : (availability.includes('WAITLIST') ? 'Waitlist' : 'Unknown'),
        bookingLink: bookingLink,
      };
    }));

    return { trains };
  }
);
