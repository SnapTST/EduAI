import { config } from 'dotenv';
config();

import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes-from-youtube.ts';
import '@/ai/flows/text-to-speech.ts';
