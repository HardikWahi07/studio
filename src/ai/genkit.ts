import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // A model is required for the 'generate' function.
      // gemini-pro is a stable and reliable model.
      model: 'gemini-pro',
    }),
  ],
});
