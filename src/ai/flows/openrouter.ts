'use server';
/**
 * @fileOverview A flow for interacting with the OpenRouter API.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const OpenRouterInputSchema = z.object({
  model: z.string().describe('The OpenRouter model to use for the chat.'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).describe('The chat messages.'),
});
export type OpenRouterInput = z.infer<typeof OpenRouterInputSchema>;

export const OpenRouterOutputSchema = z.object({
  message: z.object({
    role: z.enum(['assistant']),
    content: z.string(),
  }),
});
export type OpenRouterOutput = z.infer<typeof OpenRouterOutputSchema>;

export async function openRouterChat(input: OpenRouterInput): Promise<OpenRouterOutput> {
  return openRouterChatFlow(input);
}

const openRouterChatFlow = ai.defineFlow(
  {
    name: 'openRouterChatFlow',
    inputSchema: OpenRouterInputSchema,
    outputSchema: OpenRouterOutputSchema,
  },
  async (input) => {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in the environment.');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return {
      message: {
        role: 'assistant',
        content,
      }
    };
  }
);