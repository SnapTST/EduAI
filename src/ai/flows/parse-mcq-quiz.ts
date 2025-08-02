'use server';
/**
 * @fileOverview An AI agent for parsing raw text into a structured MCQ quiz.
 *
 * - parseMcqQuiz - A function that handles the parsing process.
 * - ParseMcqQuizInput - The input type for the function.
 * - ParseMcqQuizOutput - The return type for the function.
 * - McqQuestion - The type for a single multiple-choice question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseMcqQuizInputSchema = z.object({
  quizText: z
    .string()
    .describe("The raw text of a multiple-choice quiz to be parsed."),
});
export type ParseMcqQuizInput = z.infer<typeof ParseMcqQuizInputSchema>;

const McqQuestionSchema = z.object({
    question: z.string().describe("The question text."),
    options: z.array(z.string()).describe("An array of possible answers."),
    answer: z.string().describe("The correct answer from the options array."),
});
export type McqQuestion = z.infer<typeof McqQuestionSchema>;


const ParseMcqQuizOutputSchema = z.object({
  questions: z.array(McqQuestionSchema).describe("The structured array of multiple-choice questions."),
});
export type ParseMcqQuizOutput = z.infer<typeof ParseMcqQuizOutputSchema>;

export async function parseMcqQuiz(input: ParseMcqQuizInput): Promise<ParseMcqQuizOutput> {
  return parseMcqQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseMcqQuizPrompt',
  input: {schema: ParseMcqQuizInputSchema},
  output: {schema: ParseMcqQuizOutputSchema},
  prompt: `You are an expert at parsing text and structuring data. Your task is to convert the following raw text, which contains a multiple-choice quiz, into a structured JSON format.

For each question, identify the question itself, the list of possible options, and the correct answer. The correct answer must be one of the options.

Quiz Text:
{{{quizText}}}
`,
});

const parseMcqQuizFlow = ai.defineFlow(
  {
    name: 'parseMcqQuizFlow',
    inputSchema: ParseMcqQuizInputSchema,
    outputSchema: ParseMcqQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
