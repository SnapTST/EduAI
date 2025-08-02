'use server';
/**
 * @fileOverview An AI agent for transcribing and summarizing audio.
 *
 * - transcribeAndSummarize - A function that handles the process.
 * - TranscribeAndSummarizeInput - The input type for the function.
 * - TranscribeAndSummarizeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAndSummarizeInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAndSummarizeInput = z.infer<typeof TranscribeAndSummarizeInputSchema>;

const TranscribeAndSummarizeOutputSchema = z.object({
  transcription: z.string().describe("The full transcription of the audio."),
  summary: z.string().describe("A concise summary of the transcribed text."),
});
export type TranscribeAndSummarizeOutput = z.infer<typeof TranscribeAndSummarizeOutputSchema>;

export async function transcribeAndSummarize(input: TranscribeAndSummarizeInput): Promise<TranscribeAndSummarizeOutput> {
  return transcribeAndSummarizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeAndSummarizePrompt',
  input: {schema: TranscribeAndSummarizeInputSchema},
  output: {schema: TranscribeAndSummarizeOutputSchema},
  prompt: `You are an expert note-taker. Your task is to perform two actions on the provided audio file:
1.  Transcribe the audio accurately.
2.  Summarize the transcribed text into clear, structured notes.

Audio: {{media url=audioDataUri}}`,
});

const transcribeAndSummarizeFlow = ai.defineFlow(
  {
    name: 'transcribeAndSummarizeFlow',
    inputSchema: TranscribeAndSummarizeInputSchema,
    outputSchema: TranscribeAndSummarizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
