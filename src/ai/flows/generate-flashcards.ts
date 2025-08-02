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

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert in creating effective study materials. Based on the provided text, generate a set of flashcards. Each flashcard should have a 'front' with a key term or a concise question, and a 'back' with its corresponding definition or answer. Focus on the most important concepts in the material.

Study Material: 
{{{studyMaterial}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
