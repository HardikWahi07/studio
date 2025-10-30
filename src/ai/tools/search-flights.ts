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
        const response = await fetch(`https://fly-scraper.p.rapidapi.com/endpoints/v1/autocomplete?query=${cityName}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'fly-scraper.p.rapidapi.com'
            }
        });
        if (!response.ok) return cityName;
        const data = await response.json();
        if (data && data.data && data.data.length > 0 && data.data[0].id) {
            return data.data[0].id;
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

        const response = await fetch(`https://fly-scraper.p.rapidapi.com/endpoints/v1/search?origin=${originIata}&destination=${destinationIata}&date=${input.date}&currency=${input.currency}&country=US`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'fly-scraper.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeFlights Tool] API error: ${response.statusText}`, errorBody);
            return { flights: [] };
        }

        const data = await response.json();

        if (!data.data || !data.data.itineraries) {
             return { flights: [] };
        }

        const flights = data.data.itineraries.slice(0, 4).map((itinerary: any) => {
            const leg = itinerary.legs[0];
            return {
                provider: leg.carriers[0].name,
                details: `Flight ${leg.carriers[0].name} ${leg.segments[0].flightNumber}`,
                duration: `${Math.floor(leg.duration/60)}h ${leg.duration % 60}m`,
                price: itinerary.price.formatted,
                bookingLink: itinerary.deeplink || 'https://www.example.com/book',
            };
        });

        return { flights };

    } catch (error) {
        console.error("[searchRealtimeFlights Tool] Failed to fetch flights:", error);
        return { flights: [] };
    }
  }
);
