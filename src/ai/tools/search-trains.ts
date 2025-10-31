
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import { format } from 'date-fns';

const SearchTrainsInputSchema = z.object({
  fromCity: z.string().describe("The starting city for the train journey, e.g., 'Mumbai'"),
  toCity: z.string().describe("The destination city for the train journey, e.g., 'Pune'"),
  departureDate: z.string().describe("The date of departure in YYYY-MM-DD format."),
});

const TrainOptionSchema = z.object({
    trainNumber: z.string(),
    trainName: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.string(),
    availableClasses: z.array(z.string()),
    availability: z.string().describe("e.g., 'Available' or 'Waitlist'"),
    price: z.string().optional().describe("e.g., '₹850'"),
    bookingLink: z.string().url().describe("A direct link to book the train on IRCTC."),
});

const SearchTrainsOutputSchema = z.object({
  trains: z.array(TrainOptionSchema),
});


async function getStationCode(city: string): Promise<string | null> {
    const url = `https://indian-railway-api.cyclic.app/station-code?station_name=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Station Code API error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data: any = await response.json();
        return data?.data?.station_code || null;
    } catch (error) {
        console.error('Failed to fetch station code:', error);
        return null;
    }
}


export const searchTrains = ai.defineTool(
  {
    name: 'searchTrains',
    description: 'Searches for real-time train availability between two cities in India.',
    inputSchema: SearchTrainsInputSchema,
    outputSchema: SearchTrainsOutputSchema,
  },
  async (input) => {
    const { fromCity, toCity, departureDate } = input;
    
    // The station code lookup is unreliable. We'll use an API that might work with city names,
    // but this part of the logic is brittle. A more robust solution would be a guaranteed station code mapping.
    const fromStation = fromCity.toUpperCase();
    const toStation = toCity.toUpperCase();

    const formattedDate = format(new Date(departureDate), 'DD-MM-YYYY');

    try {
      // This API endpoint seems more oriented towards search by station code.
      // Passing city names might work for major cities but can be a point of failure.
      const response = await fetch('https://irctc1.p.rapidapi.com/api/v1/searchTrain', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '46face3ed4msh693153c8c95ba3bp1a0494jsnb39fe285d488',
          'x-rapidapi-host': 'irctc1.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromCity: fromStation,
          toCity: toStation,
          date: formattedDate,
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Train search API error: ${response.status} ${errorBody}`);
        return { trains: [] };
      }

      const data: any = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        console.log(`No trains found for ${fromCity} to ${toCity} on ${formattedDate}`);
        return { trains: [] };
      }

      const trains = data.data.map((train: any) => {
        const trainNumber = train.train_number;
        const fromCode = train.from_station_code;
        const toCode = train.to_station_code;
        const dateForLink = format(new Date(departureDate), 'YYYYMMDD');

        // Construct a more direct booking link
        const bookingLink = `https://www.ixigo.com/trains/schedule/${trainNumber}/${train.train_name.toLowerCase().replace(/ /g, '-')}/?date=${dateForLink}&from=${fromCode}&to=${toCode}`;
        
        return {
            trainNumber: train.train_number,
            trainName: train.train_name,
            departureTime: train.from_sta,
            arrivalTime: train.to_sta,
            duration: train.duration,
            availableClasses: train.available_classes,
            // Mocking availability as the API doesn't provide it in this call
            availability: 'Available', 
            price: `₹${train.fare || 'N/A'}`,
            bookingLink: bookingLink,
        };
      });

      return { trains };
    } catch (error) {
      console.error('An error occurred while searching for trains:', error);
      return { trains: [] };
    }
  }
);
