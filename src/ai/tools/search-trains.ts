
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

      const apiTravelClass = input.travelClass ? classMap[input.travelClass] || 'SL' : 'SL';
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
      if (input.fastest_train_duration_hours) {
        trains = trains.filter((train: any) => {
            if (!train.duration) return false;
            const hours = parseInt(train.duration.split(':')[0], 10);
            return !isNaN(hours) && hours < input.fastest_train_duration_hours!;
        });
      }

      // 🔹 Step 2: For each train, check seat availability & price
      const results = await Promise.all(
        trains.slice(0, 4).map(async (train: any) => {
          try {
            const [availabilityRes, priceRes] = await Promise.all([
              fetch(
                `https://irctc1.p.rapidapi.com/api/v1/checkSeatAvailability?trainNo=${train.train_number}&fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&classType=${apiTravelClass}&quota=GN&date=${formattedDate}`,
                {
                  headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                    'X-RapidAPI-Host': 'irctc1.p.rapidapi.com',
                  },
                }
              ),
              fetch(
                `https://irctc1.p.rapidapi.com/api/v1/checkPrice?trainNo=${train.train_number}&fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&date=${formattedDate}&classType=${apiTravelClass}`,
                {
                  headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                    'X-RapidAPI-Host': 'irctc1.p.rapidapi.com',
                  },
                }
              ),
            ]);

            let availability = 'Unknown';
            if (availabilityRes.ok) {
                const availabilityData = await availabilityRes.json();
                availability =
                availabilityData?.data?.[0]?.current_status ||
                availabilityData?.data?.current_status ||
                'Unknown';
            } else {
                console.warn(`[searchRealtimeTrains] Availability check failed for train ${train.train_number}: ${availabilityRes.statusText}`);
            }

            let price = `${input.currency} 1200`; // Default price
            if (priceRes.ok) {
                const priceData = await priceRes.json();
                 price = priceData?.data?.total_fare
                ? `${input.currency} ${priceData.data.total_fare}`
                : `${input.currency} 1200`; // Use default if fare is missing
            } else {
                 console.warn(`[searchRealtimeTrains] Price check failed for train ${train.train_number}: ${priceRes.statusText}`);
            }

            return {
              type: 'train' as const,
              provider: 'Indian Railways',
              details: `Train ${train.train_number} - ${train.train_name}`,
              duration: train.duration,
              price,
              bookingLink: 'https://www.irctc.co.in/',
              ecoFriendly: true,
              availability,
            };
          } catch (innerErr) {
            console.error(`[searchRealtimeTrains] Failed to process train ${train.train_number}:`, innerErr);
            return null; // Return null if processing for a single train fails
          }
        })
      );

      // Filter out null responses from failed individual train lookups
      return results.filter((r): r is NonNullable<typeof r> => r !== null);

    } catch (err) {
      console.error('[searchRealtimeTrains] A fatal error occurred:', err);
      return []; // Return empty array on fatal error
    }
  }
);
