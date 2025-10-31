'use server';
/**
 * @fileOverview A tool for fetching real-time hotel data from Booking.com.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// In-memory cache for destination IDs to avoid repeated API calls.
const destIdCache = new Map<string, { dest_id: string; dest_type: string }>();

async function getBookingComDestinationId(cityName: string): Promise<{ dest_id: string; dest_type: string } | null> {
    const query = cityName.split(',')[0].trim().toLowerCase();
    if (destIdCache.has(query)) {
        console.log(`[getBookingComDestinationId] Cache hit for ${query}`);
        return destIdCache.get(query)!;
    }

    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[getBookingComDestinationId] RAPIDAPI_KEY is not set. Skipping destination ID lookup.");
        return null;
    }
    
    try {
        console.log(`[getBookingComDestinationId] Cache miss for ${query}. Fetching from booking-com15 API...`);
        const response = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });
        if (!response.ok) {
            console.error(`[getBookingComDestinationId] API error fetching dest ID for ${query}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const result = {
                dest_id: data.data[0].dest_id,
                dest_type: data.data[0].dest_type
            };
            console.log(`[getBookingComDestinationId] Found destination for ${query}:`, result);
            destIdCache.set(query, result);
            return result;
        }
    } catch (error) {
        console.error(`[getBookingComDestinationId] Failed to get destination ID for ${query}:`, error);
    }
    
    console.warn(`[getBookingComDestinationId] No destination ID found for ${query}.`);
    return null;
}


export const searchRealtimeHotels = ai.defineTool(
  {
    name: 'searchRealtimeHotels',
    description: 'Searches for real-time hotel options for a given destination and dates.',
    inputSchema: z.object({
      destination: z.string().describe('The city or area to search for hotels in.'),
      checkinDate: z.string().describe('The check-in date in YYYY-MM-DD format.'),
      checkoutDate: z.string().describe('The check-out date in YYYY-MM-DD format.'),
      travelers: z.number().describe('The number of adults staying.'),
      currency: z.string().describe('The currency for prices (e.g., USD, EUR).'),
      accommodationBudget: z.enum(['budget', 'moderate', 'luxury']).optional().describe('The budget for accommodation.'),
    }),
    outputSchema: z.array(z.object({
        name: z.string(),
        style: z.string().describe("e.g., 'Luxury', 'Boutique', 'Budget-friendly'"),
        pricePerNight: z.string(),
        rating: z.number(),
        bookingLink: z.string().url(),
    })),
  },
  async (input) => {
    console.log(`[searchRealtimeHotels Tool] Searching for hotels in ${input.destination}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeHotels Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return [];
    }
    
    try {
        // 1. Get destination ID from Booking.com using the new endpoint
        const destInfo = await getBookingComDestinationId(input.destination);
        if (!destInfo) {
             console.error(`[searchRealtimeHotels Tool] No destination ID found for ${input.destination}`);
            return [];
        }
        
        // 2. Search for hotels with the destination ID
        const searchParams = new URLSearchParams({
            dest_id: destInfo.dest_id,
            dest_type: destInfo.dest_type,
            arrival_date: input.checkinDate,
            departure_date: input.checkoutDate,
            adults: input.travelers.toString(),
            currency_code: input.currency,
            page_number: '1',
        });
        
        // Map budget to star rating if provided
        const starMap = {
          budget: '2,3',
          moderate: '3,4',
          luxury: '5',
        };
        if (input.accommodationBudget) {
          searchParams.append('star_rating', starMap[input.accommodationBudget]);
        }


        const hotelsResponse = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${searchParams.toString()}`, {
             headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
            }
        });

        if (!hotelsResponse.ok) {
            const errorBody = await hotelsResponse.text();
            console.error(`[searchRealtimeHotels Tool] API error searching hotels: ${hotelsResponse.statusText}`, errorBody);
            return [];
        }
        
        const hotelsData = await hotelsResponse.json();
        
        if (!hotelsData || !hotelsData.data?.hotels) {
             console.log("[searchRealtimeHotels Tool] No hotels found in API response.");
             return [];
        }

        const hotels = hotelsData.data.hotels.slice(0, 3).map((hotel: any) => {
            return {
                name: hotel.hotel_name,
                style: hotel.property_type,
                pricePerNight: hotel.price, // The new API provides a formatted string like "US$123"
                rating: hotel.review_score ? parseFloat(hotel.review_score.toFixed(1)) : 0.0,
                bookingLink: `https://www.booking.com${hotel.url}`,
            };
        });

        return hotels;

    } catch (error) {
        console.error("[searchRealtimeHotels Tool] Failed to fetch hotels:", error);
        return [];
    }
  }
);
