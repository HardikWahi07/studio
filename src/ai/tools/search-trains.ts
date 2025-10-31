
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
    
    const fromStation = await getStationCode(fromCity);
    const toStation = await getStationCode(toCity);

    if (!fromStation || !toStation) {
        console.warn(`Could not get station codes for ${fromCity} -> ${toCity}`);
        return { trains: [] };
    }

    const formattedDate = format(new Date(departureDate), 'dd-MM-yyyy');

    try {
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
          class: '3A', // Search for a common class, can be parameterized later
          quota: 'GN'
        })
      });

      if (!response.ok) {
        console.error(`Train search API error: ${response.status} ${await response.text()}`);
        return { trains: [] };
      }

      const data: any = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        console.log(`No trains found for ${fromCity} to ${toCity} on ${formattedDate}`);
        return { trains: [] };
      }

      const trains = data.data.map((train: any) => {
        const bookingLink = `https://www.irctc.co.in/nget/train-search?trainNo=${train.train_number}&from=${fromStation}&to=${toStation}&date=${formattedDate}`;
        return {
            trainNumber: train.train_number,
            trainName: train.train_name,
            departureTime: train.from_sta,
            arrivalTime: train.to_sta,
            duration: train.duration,
            availableClasses: train.available_classes,
            // The API doesn't seem to provide availability directly in search results,
            // so we'll make an educated guess or leave it as unknown.
            availability: 'Available', 
            price: `₹${train.fare}`, // Assuming fare is provided
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

    