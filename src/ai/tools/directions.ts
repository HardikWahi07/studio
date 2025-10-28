
'use server';

/**
 * @fileOverview A Genkit tool for fetching directions from the Google Maps API.
 * - getDirections - A tool that retrieves travel time and route information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TransportSegmentSchema } from '../flows/plan-trip.types';

const DirectionsInputSchema = z.object({
  origin: z.string().describe('The starting point for the directions.'),
  destination: z.string().describe('The destination point for the directions.'),
  mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).describe('The mode of travel.'),
});

const DirectionsOutputSchema = TransportSegmentSchema.extend({
  distance: z.string().describe("The total distance of the route, e.g., '15 km'."),
});

// Helper function to determine if a travel mode is eco-friendly
const isEcoFriendly = (mode: string, steps: any[]): boolean => {
    if (['walking', 'bicycling', 'transit'].includes(mode)) {
        return true;
    }
    // Check if transit involves rail
    if (mode === 'transit' && steps.some(step => step.travel_mode === 'TRANSIT' && step.transit_details?.line?.vehicle?.type === 'HEAVY_RAIL')) {
        return true;
    }
    return false;
};

export const getDirections = ai.defineTool(
  {
    name: 'getDirections',
    description: 'Get travel directions, duration, and distance from the Google Maps API.',
    inputSchema: DirectionsInputSchema,
    outputSchema: DirectionsOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set.');
    }
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(input.origin)}&destination=${encodeURIComponent(input.destination)}&mode=${input.mode}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.error('Directions API Error:', data.error_message || data.status);
      throw new Error(`Could not find directions for the given locations. Status: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Create a summarized description from the steps
    const summary = route.summary || leg.steps.map((step: any) => step.html_instructions.replace(/<[^>]*>/g, '')).join(', ');

    return {
      mode: input.mode.charAt(0).toUpperCase() + input.mode.slice(1),
      duration: leg.duration.text,
      description: summary,
      ecoFriendly: isEcoFriendly(input.mode, leg.steps),
      distance: leg.distance.text,
    };
  }
);
