import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text, HelpCircle, FileScan, ArrowRight, Youtube, Volume2, CheckSquare, FileText, Edit, CalendarDays, MessageCircleQuestion, ClipboardCheck, Mic } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'AI Summarizer',
    description:
      'Upload documents or paste text to get concise, AI-generated summaries in seconds. Perfect for quick reviews.',
    href: '/summarizer',
    icon: <Text className="h-8 w-8 text-primary" />,
    cta: 'Summarize Content',
  },
  {
    title: 'Quiz Generator',
    description:
      'Turn your study materials into interactive quizzes. Test your knowledge and identify areas for improvement.',
    href: '/quiz-generator',
    icon: <HelpCircle className="h-8 w-8 text-primary" />,
    cta: 'Create a Quiz',
  },
  {
    title: 'Exam Builder',
    description:
      'Snap a photo of your textbook or notes, and our AI will generate potential exam questions to help you prepare.',
    href: '/exam-builder',
    icon: <FileScan className="h-8 w-8 text-primary" />,
    cta: 'Build an Exam',
  },
  {
    title: 'YouTube Video Notes',
    description: 'Paste a YouTube video link to get a summary, notes, and a quiz based on the video\'s content.',
    href: '/youtube-notes',
    icon: <Youtube className="h-8 w-8 text-primary" />,
    cta: 'Generate Notes',
  },
  {
    title: 'Text-to-Voice Reading',
    description: 'Turn your notes and study materials into audio lessons that you can listen to on the go.',
    href: '/text-to-voice',
    icon: <Volume2 className="h-8 w-8 text-primary" />,
    cta: 'Convert to Audio',
  },
  {
    title: 'Assignment Checker',
    description: 'Paste or upload your assignment answer to get an evaluation and suggestions for improvement from our AI.',
    href: '/assignment-checker',
    icon: <CheckSquare className="h-8 w-8 text-primary" />,
    cta: 'Check Assignment',
  },
  {
    title: 'AI Flashcard Maker',
    description: 'Automatically turn your notes and study material into interactive flashcards for effective revision.',
    href: '/flashcard-maker',
    icon: <FileText className="h-8 w-8 text-primary" />,
    cta: 'Create Flashcards',
  },
  {
    title: 'Handwriting to Notes',
    description: 'Upload an image of your handwritten notes and get clean, typed text in seconds.',
    href: '/handwriting-to-notes',
    icon: <Edit className="h-8 w-8 text-primary" />,
    cta: 'Convert to Text',
  },
  {
    title: 'Study Planner',
    description: 'Generate a custom study plan based on your goals and timeline to stay organized and focused.',
    href: '/study-planner',
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    cta: 'Create a Plan',
  },
  {
    title: 'AI Explainer Bot',
    description: 'Ask any question and get clear, simple explanations with examples to help you understand tough topics.',
    href: '/explainer-bot',
    icon: <MessageCircleQuestion className="h-8 w-8 text-primary" />,
    cta: 'Ask a Question',
  },
  {
    title: 'Past Paper Analyzer',
    description: 'Upload past papers to detect repeated questions and identify key topics to focus on for your exams.',
    href: '/past-paper-analyzer',
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    cta: 'Analyze Paper',
  },
  {
    title: 'Voice-to-Text Notes',
    description: 'Record your voice or upload audio to get it transcribed and summarized into notes.',
    href: '/voice-to-text-notes',
    icon: <Mic className="h-8 w-8 text-primary" />,
    cta: 'Transcribe Audio',
  }
];

export function Dashboard() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter mb-4">
            Your AI-Powered Study Partner
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Leverage the power of AI to summarize content, generate quizzes, and
            create exams from your notes. All for free, forever.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <Card
              key={tool.title}
              className="flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-full">{tool.icon}</div>
                <div className="flex-1">
                  <CardTitle className="font-headline text-2xl">
                    {tool.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <CardDescription className="flex-1">
                  {tool.description}
                </CardDescription>
                <Button asChild className="mt-6 w-full bg-primary hover:bg-primary/90">
                  <Link href={tool.href}>
                    {tool.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
