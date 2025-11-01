
'use server';

/**
 * @fileOverview An AI agent to simulate chatting with a local artisan.
 *
 * - getArtisanChatResponse - A function that provides contextual answers from an artisan's perspective.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArtisanChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
  query: z.string().describe('The user\'s latest question.'),
  artisanName: z.string().describe("The name of the artisan business."),
  artisanDescription: z.string().describe("A brief description of what the artisan offers."),
});

export type ArtisanChatInput = z.infer<typeof ArtisanChatInputSchema>;

export async function getArtisanChatResponse(input: ArtisanChatInput): Promise<string> {
    const result = await getArtisanChatResponseFlow(input);
    return result;
}

const getArtisanChatResponseFlow = ai.defineFlow(
  {
    name: 'getArtisanChatResponseFlow',
    inputSchema: ArtisanChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, query, artisanName, artisanDescription }) => {

    const llmResponse = await ai.generate({
        prompt: query,
        history: history,
        model: 'googleai/gemini-2.5-flash-lite',
        system: `You are an AI simulating a friendly local artisan named ${artisanName}. 
        Your business is described as: "${artisanDescription}".
        
        Your persona is helpful, welcoming, and passionate about your craft. 
        Answer the user's questions from this perspective.
        Keep your answers concise and friendly.
        If a question is unrelated to your craft or business (e.g., asking about the weather or politics), gently steer the conversation back to your offerings.
        For example: "That's an interesting question! I'm mostly focused on my craft here at the studio. Were you interested in learning about our pottery workshops?"
        `,
    });

    return llmResponse.text || "I'm sorry, I had trouble generating a response. Please try again.";
  }
);
// final commit
