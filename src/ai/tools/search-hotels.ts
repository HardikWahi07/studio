'use server';
/**
 * @fileOverview A tool for fetching real-time hotel data from Booking.com.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { format, add } from 'date-fns';

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
        // 1. Get destination ID from Booking.com
        const destResponse = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${encodeURIComponent(input.destination)}&locale=en-gb`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
            }
        });

        if (!destResponse.ok) {
            console.error(`[searchRealtimeHotels Tool] API error getting dest ID: ${destResponse.statusText}`);
            return [];
        }
        
        const destData = await destResponse.json();
        if (!destData || destData.length === 0) {
            console.error(`[searchRealtimeHotels Tool] No destination ID found for ${input.destination}`);
            return [];
        }
        const destinationId = destData[0].dest_id;
        const destType = destData[0].dest_type;

        // 2. Search for hotels with the destination ID
        const searchParams = new URLSearchParams({
            dest_id: destinationId,
            dest_type: destType,
            checkin_date: input.checkinDate,
            checkout_date: input.checkoutDate,
            adults_number: input.travelers.toString(),
            order_by: 'popularity',
            units: 'metric',
            room_number: '1',
            filter_by_currency: input.currency,
            locale: 'en-gb',
            page_number: '0',
            include_adjacency: 'true',
        });
        
        // Map budget to star rating
        const starMap = {
          budget: 'class::2,class::3', // 2 & 3 stars
          moderate: 'class::3,class::4', // 3 & 4 stars
          luxury: 'class::5', // 5 stars
        };
        if (input.accommodationBudget) {
          searchParams.append('categories_filter_ids', starMap[input.accommodationBudget]);
        }


        const hotelsResponse = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/search?${searchParams.toString()}`, {
             headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
            }
        });

        if (!hotelsResponse.ok) {
            const errorBody = await hotelsResponse.text();
            console.error(`[searchRealtimeHotels Tool] API error searching hotels: ${hotelsResponse.statusText}`, errorBody);
            return [];
        }
        
        const hotelsData = await hotelsResponse.json();
        
        if (!hotelsData || !hotelsData.result) {
             return [];
        }

        const hotels = hotelsData.result.slice(0, 3).map((hotel: any) => {
            const price = hotel.composite_price_breakdown?.gross_amount_per_night?.value || hotel.min_total_price;
            return {
                name: hotel.hotel_name,
                style: hotel.accommodation_type_name,
                pricePerNight: `${hotel.currency_code} ${Math.round(price)}`,
                rating: hotel.review_score ? parseFloat(hotel.review_score.toFixed(1)) : 0.0,
                bookingLink: hotel.url,
            };
        });

        return hotels;

    } catch (error) {
        console.error("[searchRealtimeHotels Tool] Failed to fetch hotels:", error);
        return [];
    }
  }
);
