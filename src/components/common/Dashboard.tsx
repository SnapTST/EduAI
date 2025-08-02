
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text, HelpCircle, FileScan, ArrowRight, Youtube, Volume2, CheckSquare, FileText, Edit, CalendarDays, MessageCircleQuestion, ClipboardCheck, Mic, Gamepad2, ClipboardList, Bookmark, Trash2, Users, Bot } from 'lucide-react';
import Link from 'next/link';
import { useSavedContent } from '@/hooks/use-saved-content';
import type { SavedContent } from '@/hooks/use-saved-content';
import { SavedContentDialog } from './SavedContentDialog';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Timestamp } from 'firebase/firestore';

const tools = [
  {
    title: 'Community Notes',
    description: 'Share your notes with the community and browse materials uploaded by other students.',
    href: '/community-notes',
    icon: <Users className="h-8 w-8 text-primary" />,
    cta: 'View Community Notes',
  },
  {
    title: 'OpenRouter Chat',
    description: 'Experiment with various AI models from OpenRouter in a simple chat interface.',
    href: '/openrouter-chat',
    icon: <Bot className="h-8 w-8 text-primary" />,
    cta: 'Start Chatting',
  },
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
  },
  {
    title: 'MCQ Game Mode',
    description: 'Convert your quizzes into a fun, gamified learning session to test your knowledge.',
    href: '/mcq-game-mode',
    icon: <Gamepad2 className="h-8 w-8 text-primary" />,
    cta: 'Play a Game',
  },
  {
    title: 'Revision Sheet Maker',
    description: 'Paste your notes and content to condense them into a single, powerful revision sheet.',
    href: '/revision-sheet-maker',
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
    cta: 'Create a Sheet',
  }
];

// A version of SavedContent that can be serialized for the dialog
interface DialogReadyContent extends Omit<SavedContent, 'timestamp'> {
  timestamp: number;
}


export function Dashboard() {
  const { user } = useAuth();
  const { savedContents, deleteContent, isLoaded } = useSavedContent();
  const [selectedContent, setSelectedContent] = useState<DialogReadyContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewContent = (content: SavedContent) => {
    // Convert Firestore Timestamp to number for serialization
    const dialogReadyContent: DialogReadyContent = {
      ...content,
      timestamp: (content.timestamp as Timestamp).toMillis(),
    };
    setSelectedContent(dialogReadyContent);
    setIsDialogOpen(true);
  };
  
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
       <SavedContentDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={selectedContent}
      />
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

        {user && (
          <div className="mt-24">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter mb-4">
                Your Saved Content
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                All your generated notes, quizzes, and summaries will appear here once you save them.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {!isLoaded && Array.from({ length: 3 }).map((_, i) => 
                  <Card key={i}>
                      <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                          <Skeleton className="h-12 w-full" />
                      </CardContent>
                      <CardContent className="flex gap-2">
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-10" />
                      </CardContent>
                  </Card>
              )}

              {isLoaded && savedContents.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground">
                      You haven't saved any content yet. Use the "Save" button on any tool to bookmark your generated content.
                  </div>
              )}

              {isLoaded && savedContents.map((content) => (
                  <Card key={content.id}>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                          <Bookmark className="h-6 w-6 text-primary" />
                          <span className='truncate'>{content.title}</span>
                          </CardTitle>
                          <CardDescription>Generated from: {content.tool}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                              {content.content}
                          </p>
                      </CardContent>
                      <CardContent className="flex justify-between items-center">
                          <Button onClick={() => handleViewContent(content)}>View Content</Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                              <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                      </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-24">
            <Card className="bg-secondary/50">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Welcome to Your Smartest Learning Companion</CardTitle>
              </CardHeader>
              <CardContent className="max-w-4xl mx-auto text-center text-muted-foreground">
                <p>
                  Welcome to the future of education — created by the brilliant mind of Prashant Pandey, a passionate innovator redefining how students learn. This AI-powered study platform is more than just a website; it's a revolution in learning, crafted with vision, dedication, and cutting-edge technology. Whether you're preparing for competitive exams, school tests, or simply exploring knowledge, this platform offers everything you need in one intelligent space. Designed by Prashant Pandey to eliminate guesswork and maximize productivity, our smart tools provide AI-generated notes, instant answers, personalized study plans, interactive quizzes, and much more — all at lightning speed. Gone are the days of boring textbooks and endless browsing. With this platform, students can experience a whole new way of mastering concepts and growing with confidence. Trusted by thousands and led by a future-focused creator, this is not just a study tool — it’s Prashant Pandey’s vision of empowered learning. Start now and become a part of the next-generation education movement
                </p>
              </CardContent>
            </Card>
        </div>

      </div>
    </section>
  );
}
