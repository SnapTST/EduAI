'use server';
/**
 * @fileOverview An AI agent for analyzing past exam papers.
 *
 * - analyzePastPaper - A function that handles the analysis process.
 * - AnalyzePastPaperInput - The input type for the function.
 * - AnalyzePastPaperOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePastPaperInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a past exam paper, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePastPaperInput = z.infer<typeof AnalyzePastPaperInputSchema>;

const AnalyzePastPaperOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the past paper, identifying key topics, question patterns, and recurring themes."),
  focusAreas: z.array(z.string()).describe("A list of recommended focus areas for the student based on the analysis."),
});
export type AnalyzePastPaperOutput = z.infer<typeof AnalyzePastPaperOutputSchema>;

export async function analyzePastPaper(input: AnalyzePastPaperInput): Promise<AnalyzePastPaperOutput> {
  return analyzePastPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePastPaperPrompt',
  input: {schema: AnalyzePastPaperInputSchema},
  output: {schema: AnalyzePastPaperOutputSchema},
  prompt: `You are an expert academic analyst. Your task is to analyze an image of a past exam paper.

Identify the main subjects, recurring topics, and the types of questions asked (e.g., multiple choice, short answer, essay). Based on your analysis, provide a summary of the paper's structure and list the key areas a student should focus on for their revision.

Past Paper Image:
{{media url=photoDataUri}}`,
});

const analyzePastPaperFlow = ai.defineFlow(
  {
    name: 'analyzePastPaperFlow',
    inputSchema: AnalyzePastPaperInputSchema,
    outputSchema: AnalyzePastPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
