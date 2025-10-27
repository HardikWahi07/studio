import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // A model is required for the 'generate' function.
  // Set a default model for all generate calls.
  model: 'googleai/gemini-2.5-flash',
});
