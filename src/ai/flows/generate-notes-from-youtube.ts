'use server';
/**
 * @fileOverview Generates notes and a quiz from a YouTube video transcript.
 *
 * - generateNotesFromYouTube - A function that handles the note and quiz generation process.
 * - GenerateNotesFromYouTubeInput - The input type for the function.
 * - GenerateNotesFromYouTubeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {YoutubeTranscript} from 'youtube-transcript';

const GenerateNotesFromYouTubeInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video.'),
});
export type GenerateNotesFromYouTubeInput = z.infer<
  typeof GenerateNotesFromYouTubeInputSchema
>;

const GenerateNotesFromYouTubeOutputSchema = z.object({
  notes: z.string().describe('The generated notes from the video transcript.'),
  quiz: z
    .string()
    .describe('A quiz generated from the video transcript, if applicable.'),
});
export type GenerateNotesFromYouTubeOutput = z.infer<
  typeof GenerateNotesFromYouTubeOutputSchema
>;

export async function generateNotesFromYouTube(
  input: GenerateNotesFromYouTubeInput
): Promise<GenerateNotesFromYouTubeOutput> {
  return generateNotesFromYouTubeFlow(input);
}

// Helper to get transcript
async function getTranscript(videoUrl: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    return transcript.map((item) => item.text).join(' ');
  } catch (error) {
    console.error('Failed to fetch transcript:', error);
    throw new Error(
      'Could not fetch transcript. The video may not have captions enabled or is invalid.'
    );
  }
}

const prompt = ai.definePrompt({
  name: 'generateNotesFromYouTubePrompt',
  input: {schema: z.object({transcript: z.string()})},
  output: {schema: GenerateNotesFromYouTubeOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to analyze the provided YouTube video transcript and perform two actions:
1.  Generate concise, well-structured study notes from the transcript. The notes should capture the key points, concepts, and examples mentioned.
2.  If the content is educational, create a short multiple-choice quiz (3-5 questions) to test understanding of the material. If the video is not educational, return an empty string for the quiz.

Transcript:
{{{transcript}}}
`,
});

const generateNotesFromYouTubeFlow = ai.defineFlow(
  {
    name: 'generateNotesFromYouTubeFlow',
    inputSchema: GenerateNotesFromYouTubeInputSchema,
    outputSchema: GenerateNotesFromYouTubeOutputSchema,
  },
  async (input) => {
    const transcript = await getTranscript(input.videoUrl);
    if (!transcript) {
        return { notes: "Failed to get transcript from the video.", quiz: "" };
    }
    const {output} = await prompt({transcript});
    return output!;
  }
);
