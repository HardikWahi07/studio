'use server';
/**
 * @fileOverview A tool for fetching the Indian Railway station code for a given city.
 */

import { config } from 'dotenv';
config();

// This is a simple in-memory cache. For a production app, you might use Redis or a similar persistent cache.
const stationCodeCache = new Map<string, string>();

/**
 * Fetches the station code for a given Indian city name.
 * Caches results in memory to avoid repeated API calls for the same city.
 * @param cityName The name of the city to search for (e.g., "Vapi", "Mumbai").
 * @returns {Promise<string | null>} The station code (e.g., "VAPI") or null if not found.
 */
export async function getStationCode(cityName: string): Promise<string | null> {
    const query = cityName.split(',')[0].trim().toLowerCase();
    if (stationCodeCache.has(query)) {
        console.log(`[getStationCode] Cache hit for ${query}: ${stationCodeCache.get(query)}`);
        return stationCodeCache.get(query)!;
    }

    console.log(`[getStationCode] Cache miss for ${query}. Fetching from API...`);

    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[getStationCode] RAPIDAPI_KEY is not set. Cannot fetch station code.");
        return null;
    }

    try {
        const response = await fetch(`https://indian-railway-api.p.rapidapi.com/api/v1/station?name=${query}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'indian-railway-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            console.error(`[getStationCode] API error fetching station code for ${query}: ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Find the most relevant station code. The API can return multiple matches.
            // We prefer exact matches or mainline stations.
            const exactMatch = data.data.find((s: any) => s.name.toLowerCase() === query || s.code.toLowerCase() === query);
            const station = exactMatch || data.data[0];
            
            console.log(`[getStationCode] Found station code for ${query}: ${station.code}`);
            stationCodeCache.set(query, station.code);
            return station.code;
        } else {
            console.warn(`[getStationCode] No station code found for ${query}.`);
            return null;
        }
    } catch (error) {
        console.error(`[getStationCode] Failed to fetch station code for ${query}:`, error);
        return null;
    }
}
