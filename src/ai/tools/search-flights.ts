
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
        const response = await fetch(`https://flight-data.p.rapidapi.com/search/airport?query=${encodeURIComponent(cityName)}&limit=1`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'flight-data.p.rapidapi.com'
            }
        });
        if (!response.ok) return cityName;
        const data = await response.json();
        if (data && data.length > 0 && data[0].iata) {
            return data[0].iata;
        }
    } catch (error) {
        console.error(`[searchRealtimeFlights Tool] Failed to get IATA code for ${cityName}:`, error);
    }
    return cityName; // Fallback
}


export const searchRealtimeFlights = ai.defineTool(
  {
    name: 'searchRealtimeFlights',
    description: 'Searches for real-time flight options between an origin and destination on a specific date for a given travel class.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the flight.'),
      destination: z.string().describe('The destination city for the flight.'),
      date: z.string().describe('The departure date in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The travel class (e.g., economy, business).'),
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

        const response = await fetch(`https://flight-data.p.rapidapi.com/search/flights?from_code=${originIata}&to_code=${destinationIata}&date=${input.date}&adults=1&class=${input.travelClass || 'economy'}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'flight-data.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeFlights Tool] API error: ${response.statusText}`, errorBody);
            return { flights: [] };
        }

        const data = await response.json();
        
        if (!data || !data.results) {
             return { flights: [] };
        }

        const flights = data.results.slice(0, 4).map((itinerary: any) => {
            const leg = itinerary.itineraries[0].segments[0];
            const price = itinerary.fare.totalFare;
            return {
                provider: leg.airline.name,
                details: `Flight ${leg.airline.code} ${leg.flightNumber}`,
                duration: `${Math.floor(itinerary.itineraries[0].duration/60)}h ${itinerary.itineraries[0].duration % 60}m`,
                price: `${itinerary.fare.currency} ${price.toLocaleString()}`,
                bookingLink: itinerary.fare.url || 'https://www.example.com/book',
            };
        });

        return { flights };

    } catch (error) {
        console.error("[searchRealtimeFlights Tool] Failed to fetch flights:", error);
        return { flights: [] };
    }
  }
);
