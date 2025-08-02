'use server';
/**
 * @fileOverview An AI agent for generating flashcards from study material.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the function.
 * - GenerateFlashcardsOutput - The return type for the function.
 * - Flashcard - The type for a single flashcard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {openRouterChat} from './openrouter';

const GenerateFlashcardsInputSchema = z.object({
  studyMaterial: z
    .string()
    .describe("The study material to generate flashcards from."),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    front: z.string().describe("The front of the flashcard (term or question)."),
    back: z.string().describe("The back of the flashcard (definition or answer)."),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;


const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe("The generated flashcards."),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}


const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async ({ studyMaterial }) => {
    const systemPrompt = `You are an expert in creating effective study materials. Based on the provided text, generate a set of flashcards. Each flashcard should have a 'front' with a key term or a concise question, and a 'back' with its corresponding definition or answer. Focus on the most important concepts in the material.

Respond with a valid JSON object matching the provided schema. Do NOT include any other text or explanation.`;

    const model = 'mistralai/mistral-7b-instruct-v0.2';

    const response = await openRouterChat({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is the study material:\n\n${studyMaterial}` },
        ]
    });
    
    try {
        // The response from openRouterChat is a string, so we need to parse it.
        const parsedJson = JSON.parse(response.message.content);
        // Validate the parsed JSON against our Zod schema.
        return GenerateFlashcardsOutputSchema.parse(parsedJson);
    } catch (e) {
        console.error("Failed to parse or validate flashcards JSON:", e);
        // If parsing fails, we'll try a fallback with Gemini to be safe.
        const fallbackResponse = await ai.generate({
            prompt: `${systemPrompt}\n\nStudy Material:\n${studyMaterial}`,
            output: { schema: GenerateFlashcardsOutputSchema },
        });
        return fallbackResponse.output()!;
    }
  }
);
