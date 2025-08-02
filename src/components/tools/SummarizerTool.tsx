'use client';

import { useState } from 'react';
import { summarizeContent } from '@/ai/flows/summarize-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function SummarizerTool() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some content to summarize.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate a summary.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeContent({ content });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
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
        <h1 className="text-4xl font-bold font-headline">AI Summarizer</h1>
        <p className="text-muted-foreground mt-2">
          Paste your content below to generate a concise summary.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content to Summarize</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="content-textarea">Enter your text, article, or document content here</Label>
            <Textarea
              id="content-textarea"
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to summarize content.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !content.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Summarizing...' : 'Generate Summary'}
          </Button>
        </CardFooter>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
            <CardDescription>
              Here is the AI-generated summary of your content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md">
              <p>{summary}</p>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={handleSaveToDrive}>
              <Save className="mr-2 h-4 w-4" /> Save to Google Drive
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
