
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
import { useSavedContent } from '@/hooks/use-saved-content';

export default function RevisionSheetMakerTool() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [revisionSheet, setRevisionSheet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveContent } = useSavedContent();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please paste your study materials to create a revision sheet.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a revision sheet.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRevisionSheet('');
    try {
      const result = await summarizeContent({ content });
      setRevisionSheet(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate revision sheet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const success = saveContent({
      title: `Revision Sheet`,
      tool: 'Revision Sheet Maker',
      content: revisionSheet,
    });
    toast({
      title: success ? 'Sheet Saved!' : 'Failed to Save',
      description: success
        ? 'Your revision sheet has been saved to the dashboard.'
        : 'There was an issue saving your sheet.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Revision Sheet Maker</h1>
        <p className="text-muted-foreground mt-2">
          Paste all your notes and materials to get a condensed revision sheet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Study Materials</CardTitle>
          <CardDescription>
            Combine all your notes, summaries, and content into the text box below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="content-textarea">Paste all your materials here</Label>
            <Textarea
              id="content-textarea"
              placeholder="Combine your notes from different tools and paste them here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to create a revision sheet.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !content.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating Sheet...' : 'Generate Revision Sheet'}
          </Button>
        </CardFooter>
      </Card>

      {revisionSheet && (
        <Card>
          <CardHeader>
            <CardTitle>Your Revision Sheet</CardTitle>
            <CardDescription>
              Here is the condensed version of your study materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
              {revisionSheet}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save to Dashboard
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
