import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text, HelpCircle, FileScan, ArrowRight } from 'lucide-react';
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
