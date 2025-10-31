
'use server';
/**
 * @fileOverview A tool for fetching real-time flight data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// In-memory cache for IATA codes to avoid repeated API calls for the same city.
const iataCache = new Map<string, string>();

async function getIataCode(cityName: string): Promise<string> {
    const query = cityName.split(',')[0].trim().toLowerCase();
    if (iataCache.has(query)) {
        console.log(`[getIataCode] Cache hit for ${query}: ${iataCache.get(query)}`);
        return iataCache.get(query)!;
    }

    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeFlights Tool] RAPIDAPI_KEY is not set. Skipping IATA code lookup.");
        return query; // Fallback to city name/code
    }
    try {
        console.log(`[getIataCode] Cache miss for ${query}. Fetching from booking-com15 API...`);
        // Using the new booking-com15 API to find location IDs
        const response = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination?query=${encodeURIComponent(query)}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });
        if (!response.ok) {
            console.error(`[getIataCode] API error fetching IATA code for ${query}: ${response.statusText}`);
            return query;
        }
        const data = await response.json();
        // The new API returns an object with a 'data' array.
        if (data.data && data.data.length > 0 && data.data[0].id) {
             const iata = data.data[0].id.replace('.AIRPORT', ''); // The ID is what we need, e.g. "BOM.AIRPORT"
            console.log(`[getIataCode] Found IATA code for ${query}: ${iata}`);
            iataCache.set(query, iata);
            return iata;
        }
    } catch (error) {
        console.error(`[getIataCode] Failed to get IATA code for ${query}:`, error);
    }
    console.warn(`[getIataCode] No IATA code found for ${query}. Falling back to query string.`);
    return query; // Fallback to the original query if no code is found
}


export const searchRealtimeFlights = ai.defineTool(
  {
    name: 'searchRealtimeFlights',
    description: 'Searches for real-time flight options between an origin and destination on a specific date for a given travel class.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the flight (e.g., "Mumbai", "London").'),
      destination: z.string().describe('The destination city for the flight (e.g., "Delhi", "Paris").'),
      date: z.string().describe('The departure date in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The travel class (e.g., economy, business).'),
      currency: z.string().describe('The desired currency for the flight prices (e.g., USD, EUR, INR).')
    }),
    outputSchema: z.array(z.object({
        type: z.literal('flight'),
        provider: z.string().describe("Airline name."),
        details: z.string().describe("Flight number and departure/arrival times."),
        duration: z.string().describe("Total flight duration."),
        price: z.string().describe("Price of the flight in the requested currency."),
        bookingLink: z.string().url().describe("A mock booking link."),
        ecoFriendly: z.boolean(),
        availability: z.string(),
    })),
  },
  async (input) => {
    console.log(`[searchRealtimeFlights Tool] Searching for flights from ${input.origin} to ${input.destination} on ${input.date}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeFlights Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return [];
    }
    
    try {
        const originIata = await getIataCode(input.origin);
        const destinationIata = await getIataCode(input.destination);

        const travelClass = (input.travelClass || 'economy').toUpperCase();

        const response = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=${originIata}.AIRPORT&toId=${destinationIata}.AIRPORT&departDate=${input.date}&adults=1&cabinClass=${travelClass}&currency_code=${input.currency}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[searchRealtimeFlights Tool] API error: ${response.statusText}`, errorBody);
            return [];
        }

        const data = await response.json();
        
        if (!data || !data.data?.flights) {
             console.log("[searchRealtimeFlights Tool] No flights found in API response.");
             return [];
        }
        
        // The API response structure is different. We need to adapt.
        const flights = data.data.flights.slice(0, 3).map((flight: any) => {
            const leg = flight.legs[0];
            const price = flight.price.formatted;
            return {
                type: 'flight' as const,
                provider: leg.carriers.marketing[0].name,
                details: `Flight ${leg.carriers.marketing[0].name} ${leg.flightNumber}`,
                duration: leg.duration,
                price: price,
                bookingLink: 'https://www.booking.com/flights', // The API doesn't provide a direct link
                ecoFriendly: false, // Flight data API doesn't provide this
                availability: 'Available'
            };
        });

        return flights;

    } catch (error) {
        console.error("[searchRealtimeFlights Tool] Failed to fetch flights:", error);
        return [];
    }
  }
);
