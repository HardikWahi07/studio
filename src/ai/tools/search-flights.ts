
'use server';
/**
 * @fileOverview A tool for fetching real-time flight data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

async function getIataCode(cityName: string): Promise<string> {
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeFlights Tool] RAPIDAPI_KEY is not set. Skipping IATA code lookup.");
        return cityName; // Fallback to city name
    }
    try {
        const response = await fetch(`https://skyscanner44.p.rapidapi.com/autocomplete?query=${cityName}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
            }
        });
        if (!response.ok) return cityName;
        const data = await response.json();
        if (data && data.length > 0 && data[0].iata_code) {
            return data[0].iata_code;
        }
    } catch (error) {
        console.error(`[searchRealtimeFlights Tool] Failed to get IATA code for ${cityName}:`, error);
    }
    return cityName; // Fallback
}


export const searchRealtimeFlights = ai.defineTool(
  {
    name: 'searchRealtimeFlights',
    description: 'Searches for real-time flight options between an origin and destination on a specific date.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the flight.'),
      destination: z.string().describe('The destination city for the flight.'),
      date: z.string().describe('The departure date in YYYY-MM-DD format.'),
      currency: z.string().describe('The currency for the prices (e.g., INR, USD).'),
    }),
    outputSchema: z.object({
        flights: z.array(z.object({
            provider: z.string().describe("Airline name."),
            details: z.string().describe("Flight number and departure/arrival times."),
            duration: z.string().describe("Total flight duration."),
            price: z.string().describe("Price of the flight in the requested currency."),
            bookingLink: z.string().url().describe("A mock booking link."),
        }))
    }),
  },
  async (input) => {
    console.log(`[searchRealtimeFlights Tool] Searching for flights from ${input.origin} to ${input.destination} on ${input.date}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeFlights Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return { flights: [] };
    }
    
    try {
        const originIata = await getIataCode(input.origin);
        const destinationIata = await getIataCode(input.destination);

        const response = await fetch(`https://skyscanner44.p.rapidapi.com/search?adults=1&origin=${originIata}&destination=${destinationIata}&departureDate=${input.date}&currency=${input.currency}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            console.error(`[searchRealtimeFlights Tool] API error: ${response.statusText}`);
            return { flights: [] };
        }

        const data = await response.json();

        if (!data.itineraries || !data.itineraries.buckets) {
             return { flights: [] };
        }

        const flights = data.itineraries.buckets.slice(0, 4).map((bucket: any) => {
            const item = bucket.items[0];
            const price = item.price.formatted;
            const leg = item.legs[0];

            return {
                provider: leg.carriers.marketing[0].name,
                details: `Flight ${leg.carriers.marketing[0].name} ${leg.flightNumbers[0].flightNumber}`,
                duration: `${leg.durationInMinutes}m`,
                price: price,
                bookingLink: item.deeplink || 'https://www.example.com/book',
            };
        });

        return { flights };

    } catch (error) {
        console.error("[searchRealtimeFlights Tool] Failed to fetch flights:", error);
        return { flights: [] };
    }
  }
);
