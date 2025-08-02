'use client';

import { useState } from 'react';
import { checkAssignment } from '@/ai/flows/check-assignment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function AssignmentCheckerTool() {
  const { user } = useAuth();
  const [assignmentText, setAssignmentText] = useState('');
  const [result, setResult] = useState<{ evaluation: string; suggestions: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!assignmentText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter your assignment text to get it checked.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to check your assignment.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await checkAssignment({ assignmentText });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to check assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDrive = () => {
    toast({ title: "Coming Soon!", description: "Google Drive integration is under development." });
  }

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Assignment Checker</h1>
        <p className="text-muted-foreground mt-2">
          Get instant feedback and suggestions on your assignment answers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assignment Answer</CardTitle>
          <CardDescription>
            Paste your assignment text into the box below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="assignment-text-area">Your Answer</Label>
            <Textarea
              id="assignment-text-area"
              placeholder="Paste your assignment answer here..."
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              className="min-h-[250px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to check your assignment.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !assignmentText.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Checking...' : 'Check My Assignment'}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation</CardTitle>
              <CardDescription>
                Here is the AI's evaluation of your assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md">
                <p>{result.evaluation}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Suggestions for Improvement</CardTitle>
               <CardDescription>
                  Consider these suggestions to improve your work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {result.suggestions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardFooter className="gap-2 -m-6 p-6">
                <Button variant="outline" onClick={handleSaveToDrive}>
                  <Save className="mr-2 h-4 w-4" /> Save Feedback
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Feedback
                </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
