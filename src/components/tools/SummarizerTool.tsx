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

export default function SummarizerTool() {
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
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !content.trim()}>
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
