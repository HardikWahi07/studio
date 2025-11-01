'use server';
/**
 * @fileOverview An AI agent for the help center chatbox.
 *
 * - getHelpChatResponse - A function that provides contextual answers to user questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HelpChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
  query: z.string().describe('The user\'s latest question.'),
});
export type HelpChatInput = z.infer<typeof HelpChatInputSchema>;

export async function getHelpChatResponse(input: HelpChatInput): Promise<string> {
    const result = await getHelpChatResponseFlow(input);
    return result;
}

const getHelpChatResponseFlow = ai.defineFlow(
  {
    name: 'getHelpChatResponseFlow',
    inputSchema: HelpChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, query }) => {

    const llmResponse = await ai.generate({
        prompt: query,
        history: history,
        model: 'googleai/gemini-2.5-flash-lite',
        system: `You are the TripMind Support Bot, a friendly and helpful AI assistant for a travel planning app. Your goal is to answer user questions about the app's features.

  **App Features:**
  - **AI Trip Planner:** Users can generate detailed, multi-day itineraries by providing destination, duration, interests, etc.
  - **My Trips:** Saved trips are stored here. Users can view and manage their planned journeys.
  - **Local Connect / Hidden Gems:** Features to discover authentic local experiences, artisans, and off-the-beaten-path locations.
  - **Expense Splitter:** A tool to create shared expense workspaces for specific trips, add expenses, and calculate who owes whom.
  - **Suggest Bookings:** A feature to get suggestions for flights and trains with smart links to booking sites.
  - **Local Supporters:** A way to connect with friendly locals for tips and assistance.
  - **Safety Companion:** An AI tool that provides safety advice and information about a location.
  - **Blog:** A place where users can read and write travel stories.

  **Your Task:**
  - Answer the user's question based on the features above.
  - Be concise, friendly, and clear.
  - Use the conversation history provided in the prompt to understand the context.
  - If you don't know the answer, say "I'm not sure about that, but you can contact our human support team at support@tripmind.com."
  `,
    });

    return llmResponse.text || "I'm sorry, I had trouble generating a response. Please try again.";
  }
);
// final commit
    
