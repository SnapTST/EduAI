'use server';
/**
 * @fileOverview An assignment checking AI agent.
 *
 * - checkAssignment - A function that handles the assignment checking process.
 * - CheckAssignmentInput - The input type for the checkAssignment function.
 * - CheckAssignmentOutput - The return type for the checkAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckAssignmentInputSchema = z.object({
  assignmentText: z
    .string()
    .describe("The user's assignment answer text."),
});
export type CheckAssignmentInput = z.infer<typeof CheckAssignmentInputSchema>;

const CheckAssignmentOutputSchema = z.object({
  evaluation: z.string().describe("The AI's evaluation of the assignment."),
  suggestions: z.string().describe("The AI's suggestions for improvement."),
});
export type CheckAssignmentOutput = z.infer<typeof CheckAssignmentOutputSchema>;

export async function checkAssignment(input: CheckAssignmentInput): Promise<CheckAssignmentOutput> {
  return checkAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkAssignmentPrompt',
  input: {schema: CheckAssignmentInputSchema},
  output: {schema: CheckAssignmentOutputSchema},
  prompt: `You are an expert teaching assistant. Your task is to evaluate a student's assignment answer and provide constructive feedback.

First, provide an overall evaluation of the answer. Then, offer specific, actionable suggestions for improvement. Be encouraging and focus on helping the student learn.

Assignment Answer:
{{{assignmentText}}}
`,
});

const checkAssignmentFlow = ai.defineFlow(
  {
    name: 'checkAssignmentFlow',
    inputSchema: CheckAssignmentInputSchema,
    outputSchema: CheckAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
