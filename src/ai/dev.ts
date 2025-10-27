
import { config } from 'dotenv';
config();
import { exec } from 'child_process';


// The Genkit server automatically discovers flows.
// Importing them here creates a dependency conflict with the Next.js environment.


// Seed the database
const seed = exec('npm run db:seed');
seed.stdout?.pipe(process.stdout);
seed.stderr?.pipe(process.stderr);
