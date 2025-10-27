
import { config } from 'dotenv';
config();
import { exec } from 'child_process';


import '@/ai/flows/explore-hidden-gems.ts';
import '@/ai/flows/generate-personalized-itineraries.ts';
import '@/ai/flows/get-safety-assistance.ts';
import '@/ai/flows/plan-trip.ts';


// Seed the database
const seed = exec('npm run db:seed');
seed.stdout?.pipe(process.stdout);
seed.stderr?.pipe(process.stderr);
