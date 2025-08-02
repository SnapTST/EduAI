'use server';
/**
 * @fileOverview Extracts text from an image and generates exam questions.
 *
 * - extractTextAndGenerateExamQuestions - A function that handles the text extraction and exam question generation process.
 * - ExtractTextAndGenerateExamQuestionsInput - The input type for the extractTextAndGenerateExamQuestions function.
 * - ExtractTextAndGenerateExamQuestionsOutput - The return type for the extractTextAndGenerateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextAndGenerateExamQuestionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of textbook pages or notes, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextAndGenerateExamQuestionsInput = z.infer<typeof ExtractTextAndGenerateExamQuestionsInputSchema>;

const ExtractTextAndGenerateExamQuestionsOutputSchema = z.object({
  examQuestions: z.array(z.string()).describe('The generated exam questions.'),
});
export type ExtractTextAndGenerateExamQuestionsOutput = z.infer<typeof ExtractTextAndGenerateExamQuestionsOutputSchema>;

export async function extractTextAndGenerateExamQuestions(
  input: ExtractTextAndGenerateExamQuestionsInput
): Promise<ExtractTextAndGenerateExamQuestionsOutput> {
  return extractTextAndGenerateExamQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextAndGenerateExamQuestionsPrompt',
  input: {schema: ExtractTextAndGenerateExamQuestionsInputSchema},
  output: {schema: ExtractTextAndGenerateExamQuestionsOutputSchema},
  prompt: `You are an expert educator specializing in generating exam questions based on provided text and images.

You will extract the text from the following image and generate possible exam questions to test the knowledge. The exam questions should be in the form of multiple choice questions.

Image: {{media url=photoDataUri}}
`,
});

const extractTextAndGenerateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'extractTextAndGenerateExamQuestionsFlow',
    inputSchema: ExtractTextAndGenerateExamQuestionsInputSchema,
    outputSchema: ExtractTextAndGenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
