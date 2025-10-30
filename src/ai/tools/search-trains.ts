'use server';
/**
 * @fileOverview A tool for fetching real-time train data from an external API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStationCode } from './get-station-code';
import { format } from 'date-fns';

export const searchRealtimeTrains = ai.defineTool(
  {
    name: 'searchRealtimeTrains',
    description: 'Searches for real-time train options between two cities for travel within India. It can take city names as input.',
    inputSchema: z.object({
      origin: z.string().describe('The origin city for the train journey (e.g., "Mumbai", "Vapi").'),
      destination: z.string().describe('The destination city for the train journey (e.g., "Delhi", "Lucknow").'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format.'),
      travelClass: z.string().optional().describe('The class of travel to check (e.g., "3A" for AC 3 Tier, "SL" for Sleeper). If not provided, a default will be used.'),
    }),
    outputSchema: z.object({
        trains: z.array(z.object({
            trainNumber: z.string(),
            trainName: z.string(),
            departureTime: z.string(),
            arrivalTime: z.string(),
            duration: z.string(),
            fare: z.string().optional(),
            travelClass: z.string(),
            availability: z.string().describe('The availability status, e.g., "AVAILABLE 100", "WL 7", "RAC 2"'),
        }))
    }),
  },
  async (input) => {
    console.log(`[searchRealtimeTrains Tool] V6: Searching for trains from ${input.origin} to ${input.destination}`);
    
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[searchRealtimeTrains Tool] RAPIDAPI_KEY environment variable not set. Returning empty array.");
        return { trains: [] };
    }

    try {
        const [originStationCode, destinationStationCode] = await Promise.all([
            getStationCode(input.origin),
            getStationCode(input.destination),
        ]);

        if (!originStationCode || !destinationStationCode) {
            console.error(`[searchRealtimeTrains Tool] Could not find station codes for ${input.origin} or ${input.destination}.`);
            return { trains: [] };
        }
        
        console.log(`[searchRealtimeTrains Tool] Found station codes: ${originStationCode} -> ${destinationStationCode}. Searching trains...`);
        const formattedDateForSearch = format(new Date(input.date), 'dd-MM-yyyy');

        const trainListResponse = await fetch(`https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&dateOfJourney=${formattedDateForSearch}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
            }
        });

        if (!trainListResponse.ok) {
            const errorBody = await trainListResponse.text();
            console.error(`[searchRealtimeTrains Tool] API error fetching trains: ${trainListResponse.statusText}`, errorBody);
            return { trains: [] };
        }
        
        const trainListData = await trainListResponse.json();
        
        if (!trainListData.status || !trainListData.data || trainListData.data.length === 0) {
            console.log(`[searchRealtimeTrains Tool] No trains found from irctc1 API for ${originStationCode} to ${destinationStationCode} on ${formattedDateForSearch}.`);
            return { trains: [] };
        }

        // The API provides many trains, we will process all of them.
        const trainsPromises = trainListData.data.map(async (train: any) => {
            // Define a default travel class if not provided, preferring AC classes.
            const preferredClasses = ["3A", "2A", "1A", "SL", "CC"];
            const availableClasses = train.available_classes || [];
            const travelClass = input.travelClass || preferredClasses.find(c => availableClasses.includes(c)) || availableClasses[0] || "SL";
            
            let availability = 'N/A';
            let fare: string | undefined = undefined;

            try {
                 const availDate = format(new Date(input.date), 'yyyy-MM-dd');
                 const availResponse = await fetch(`https://irctc1.p.rapidapi.com/api/v2/checkSeatAvailability?trainNo=${train.train_number}&fromStationCode=${originStationCode}&toStationCode=${destinationStationCode}&classType=${travelClass}&quota=GN&date=${availDate}`, {
                     headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
                     }
                 });

                 if (availResponse.ok) {
                     const availData = await availResponse.json();
                     if (availData.status && availData.data && availData.data.length > 0) {
                        const firstAvail = availData.data[0];
                        // Normalize availability status
                        if (firstAvail.availability_status.startsWith('AVAILABLE')) {
                            availability = 'Available';
                        } else if (firstAvail.availability_status.startsWith('WL')) {
                            availability = 'Waitlist';
                        } else {
                            availability = firstAvail.availability_status; // REGRET, etc.
                        }
                        fare = `₹${firstAvail.total_fare}`;
                     } else {
                         availability = availData.message || 'Not Available';
                     }
                 } else {
                     const errorText = await availResponse.text();
                     console.warn(`[searchRealtimeTrains Tool] Could not fetch availability for train ${train.train_number}, status: ${availResponse.status}, body: ${errorText}`);
                     availability = 'Error';
                 }
            } catch (e) {
                 console.error(`[searchRealtimeTrains Tool] Exception when fetching availability for train ${train.train_number}`, e);
                 availability = 'Error Fetching';
            }

            return {
                trainNumber: train.train_number,
                trainName: train.train_name,
                departureTime: train.from_sta,
                arrivalTime: train.to_sta,
                duration: train.duration,
                fare: fare,
                travelClass: travelClass,
                availability: availability
            };
        });

        const trains = await Promise.all(trainsPromises);
        console.log(`[searchRealtimeTrains Tool] Found ${trains.length} trains.`);
        return { trains };

    } catch (error) {
        console.error("[searchRealtimeTrains Tool] Failed to fetch trains:", error);
        return { trains: [] };
    }
  }
);
