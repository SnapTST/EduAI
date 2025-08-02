import { config } from 'dotenv';
config();

import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes-from-youtube.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/check-assignment.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-study-plan.ts';
import '@/ai/flows/explain-topic.ts';
import '@/ai/flows/analyze-past-paper.ts';
import '@/ai/flows/transcribe-and-summarize.ts';
import '@/ai/flows/parse-mcq-quiz.ts';
