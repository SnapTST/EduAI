'use client';

import { useState } from 'react';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2 } from 'lucide-react';
import { Label } from '../ui/label';

export default function QuizGeneratorTool() {
  const [studyMaterial, setStudyMaterial] = useState('');
  const [quiz, setQuiz] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!studyMaterial.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please provide some study material to generate a quiz.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setQuiz('');
    try {
      const result = await generateQuiz({ studyMaterial });
      setQuiz(result.quiz);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Quiz Generator</h1>
        <p className="text-muted-foreground mt-2">
          Transform your notes and documents into interactive quizzes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Material</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid w-full gap-2">
            <Label htmlFor="study-material-textarea">Paste your study material below</Label>
            <Textarea
              id="study-material-textarea"
              placeholder="Paste your notes, an article, or any study material here..."
              value={studyMaterial}
              onChange={(e) => setStudyMaterial(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !studyMaterial.trim()}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
          </Button>
        </CardFooter>
      </Card>

      {quiz && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Quiz</CardTitle>
            <CardDescription>
              Test your knowledge with this AI-generated quiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
              {quiz}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" /> Save to Google Drive
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
