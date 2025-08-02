'use server';
/**
 * @fileOverview An AI agent for explaining complex topics.
 *
 * - explainTopic - A function that handles the topic explanation process.
 * - ExplainTopicInput - The input type for the function.
 * - ExplainTopicOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTopicInputSchema = z.object({
  topic: z.string().describe("The topic or question the user wants an explanation for."),
});
export type ExplainTopicInput = z.infer<typeof ExplainTopicInputSchema>;


const ExplainTopicOutputSchema = z.object({
  explanation: z.string().describe("A clear and simple explanation of the topic, with real-world examples if possible."),
});
export type ExplainTopicOutput = z.infer<typeof ExplainTopicOutputSchema>;

export async function explainTopic(input: ExplainTopicInput): Promise<ExplainTopicOutput> {
  return explainTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTopicPrompt',
  input: {schema: ExplainTopicInputSchema},
  output: {schema: ExplainTopicOutputSchema},
  prompt: `You are an expert educator and explainer. A student has asked for help understanding a topic.

Your task is to explain the following topic or question in a clear, simple, and concise way. Use real-world examples or analogies to make the concept easier to understand. Avoid jargon where possible, or explain it clearly if it's necessary.

Topic/Question: "{{{topic}}}"
`,
});

const explainTopicFlow = ai.defineFlow(
  {
    name: 'explainTopicFlow',
    inputSchema: ExplainTopicInputSchema,
    outputSchema: ExplainTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
