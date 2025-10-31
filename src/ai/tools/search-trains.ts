
'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API with live availability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStationCode } from './get-station-code';
import { format } from 'date-fns';

const classMap: Record<string, string> = {
  'ac-first-class': '1A',
  'ac-2-tier': '2A',
  'ac-3-tier': '3A',
  'sleeper': 'SL',
  'chair-car': 'CC'
};

export const searchRealtimeTrains = ai.defineTool(
  {
    name: 'searchRealtimeTrains',
    description: 'Searches for real-time train options between two cities for travel within India, including availability status.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey (e.g., "Mumbai", "Vapi").'),
      destination: z.string().describe('The destination city for the train journey (e.g., "Delhi", "Lucknow").'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The class of travel (e.g., "ac-3-tier", "sleeper").'),
      currency: z.string().describe('The desired currency for the train fares (e.g., USD, EUR, INR).'),
      fastest_train_duration_hours: z.number().optional().describe('An optional filter to only return trains faster than this duration in hours.'),
    }),
    outputSchema: z.array(z.object({
      type: z.literal('train'),
      provider: z.string(),
      details: z.string(),
      duration: z.string(),
      price: z.string(),
      bookingLink: z.string().url(),
      ecoFriendly: z.boolean(),
      availability: z.string(),
    })),
  },
  async (input) => {
    console.log(`[searchRealtimeTrains] From ${input.origin} → ${input.destination}`);

    if (!process.env.RAPIDAPI_KEY) {
      console.warn('[searchRealtimeTrains] No RAPIDAPI_KEY found.');
      return [];
    }

    try {
      const [originStationCode, destinationStationCode] = await Promise.all([
        getStationCode(input.origin),
        getStationCode(input.destination),
      ]);

      if (!originStationCode || !destinationStationCode) {
        console.error(`[searchRealtimeTrains] Station code missing for ${input.origin} or ${input.destination}`);
        return [];
      }
      
      const formattedDate = format(new Date(input.date), 'yyyy-MM-dd');

      // 🔹 Step 1: Fetch trains between stations
      const response = await fetch(
        `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&dateOfJourney=${formattedDate}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'irctc1.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        console.error(`[searchRealtimeTrains] API Error fetching trains: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      if (!data?.data?.length) {
        console.log('[searchRealtimeTrains] No trains found.');
        return [];
      }

      let trains = data.data;

      // Filter by duration if requested
      if (input.fastest_train_duration_hours) {
        trains = trains.filter((train: any) => {
            if (!train.duration) return false;
            const hours = parseInt(train.duration.split(':')[0], 10);
            return !isNaN(hours) && hours < input.fastest_train_duration_hours!;
        });
      }
      
      // Map the results to our desired format
      const results = trains.slice(0, 4).map((train: any) => {
        // The API returns a complex structure, so we safely access the data.
        const price = train.fare ?? 'N/A';
        const availability = train.current_status ?? 'Unknown';

        return {
          type: 'train' as const,
          provider: 'Indian Railways',
          details: `Train ${train.train_number} - ${train.train_name}`,
          duration: train.duration || 'N/A',
          price: price !== 'N/A' ? `${input.currency} ${price}` : `Price not available`,
          bookingLink: 'https://www.irctc.co.in/',
          ecoFriendly: true,
          availability: availability,
        };
      });

      return results;

    } catch (err) {
      console.error('[searchRealtimeTrains] A fatal error occurred:', err);
      return []; // Return empty array on fatal error
    }
  }
);
