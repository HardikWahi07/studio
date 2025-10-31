'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API.
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
    description: 'Searches for real-time train options between two cities for travel within India. It can take city names as input.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey (e.g., "Mumbai", "Vapi").'),
      destination: z.string().describe('The destination city for the train journey (e.g., "Delhi", "Lucknow").'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The class of travel (e.g., "ac-3-tier", "sleeper").'),
      currency: z.string().describe('The desired currency for the train fares (e.g., USD, EUR, INR).'),
    }),
    outputSchema: z.array(z.object({
        type: z.literal('train'),
        provider: z.string(),
        details: z.string().describe('Train number and name'),
        duration: z.string(),
        price: z.string(),
        bookingLink: z.string().url(),
        ecoFriendly: z.boolean(),
        availability: z.string().describe('The availability status, e.g., "Available", "Waitlist", "Sold Out"'),
    })),
  },
  async (input) => {
    console.log(`[searchRealtimeTrains Tool] Searching for trains from ${input.origin} to ${input.destination}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeTrains Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return [];
    }

    try {
        const [originStationCode, destinationStationCode] = await Promise.all([
            getStationCode(input.origin),
            getStationCode(input.destination),
        ]);

        if (!originStationCode || !destinationStationCode) {
            console.error(`[searchRealtimeTrains Tool] Could not find station codes for ${input.origin} or ${input.destination}.`);
            return [];
        }
        
        const apiTravelClass = input.travelClass ? classMap[input.travelClass] || 'SL' : 'SL';
        const formattedDate = format(new Date(input.date), 'yyyy-MM-dd');

        const response = await fetch(`https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&dateOfJourney=${formattedDate}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeTrains Tool] API error fetching trains: ${response.statusText}`, errorBody);
            return [];
        }
        
        const data = await response.json();
        
        if (!data || !data.data || data.data.length === 0) {
            console.log(`[searchRealtimeTrains Tool] No trains found for ${originStationCode} to ${destinationStationCode}.`);
            return [];
        }
        
        const priceResponse = await fetch(`https://irctc1.p.rapidapi.com/api/v1/checkPrice?trainNo=${data.data[0].train_number}&fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&date=${formattedDate}&classType=${apiTravelClass}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });
        const priceData = await priceResponse.json();
        const price = priceData?.data?.total_fare ? `${input.currency} ${priceData.data.total_fare}` : `${input.currency} 1,200`;


        return data.data.slice(0, 3).map((train: any) => {
            return {
                type: 'train' as const,
                provider: "Indian Railways",
                details: `Train ${train.train_number} - ${train.train_name}`,
                duration: train.duration,
                price: price, // API does not provide price, using a placeholder
                bookingLink: 'https://www.irctc.co.in/',
                ecoFriendly: true,
                availability: 'Available' // API does not provide availability, assuming 'Available'
            };
        });

    } catch (error) {
        console.error("[searchRealtimeTrains Tool] Failed to fetch trains:", error);
        return [];
    }
  }
);
