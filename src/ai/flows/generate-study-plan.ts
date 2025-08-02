'use server';
/**
 * @fileOverview An AI agent for generating personalized study plans.
 *
 * - generateStudyPlan - A function that handles the study plan generation process.
 * - GenerateStudyPlanInput - The input type for the function.
 * - GenerateStudyPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
  subject: z.string().describe("The subject the user wants to study."),
  goal: z.string().describe("The user's specific goal for the study session (e.g., 'pass the final exam', 'understand chapter 5')."),
  days: z.number().int().positive().describe("The number of days available for studying."),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;


const GenerateStudyPlanOutputSchema = z.object({
  plan: z.string().describe("A detailed, day-by-day study plan in a structured format (e.g., Markdown)."),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert academic advisor who creates personalized study plans. A student needs a plan for the subject '{{{subject}}}'.

Their goal is: "{{{goal}}}".
They have {{{days}}} days to study.

Create a detailed, day-by-day study schedule. The plan should be realistic, breaking down topics, suggesting study techniques (like active recall or spaced repetition), and scheduling short breaks. The output should be formatted in Markdown.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
