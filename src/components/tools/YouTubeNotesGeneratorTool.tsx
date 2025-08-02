
'use client';

import { useState } from 'react';
import { generateNotesFromYouTube } from '@/ai/flows/generate-notes-from-youtube';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2 } from 'lucide-react';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useSavedContent } from '@/hooks/use-saved-content';

export default function YouTubeNotesGeneratorTool() {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{ notes: string; quiz: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveContent } = useSavedContent();

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'YouTube URL Required',
        description: 'Please enter a valid YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }
     if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate notes.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateNotesFromYouTube({ videoUrl });
      setGeneratedContent(result);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate notes. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (!generatedContent) return;
    const success = saveContent({
      title: `Notes for ${videoUrl}`,
      tool: 'YouTube Notes Generator',
      content: generatedContent.notes,
    });
    toast({
      title: success ? 'Notes Saved!' : 'Failed to Save',
      description: success
        ? 'Your notes have been saved to the dashboard.'
        : 'There was an issue saving your notes.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleSaveQuiz = () => {
    if (!generatedContent || !generatedContent.quiz) return;
    const success = saveContent({
      title: `Quiz for ${videoUrl}`,
      tool: 'YouTube Notes Generator',
      content: generatedContent.quiz,
    });
    toast({
      title: success ? 'Quiz Saved!' : 'Failed to Save',
      description: success
        ? 'Your quiz has been saved to the dashboard.'
        : 'There was an issue saving your quiz.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">YouTube Video Notes Generator</h1>
        <p className="text-muted-foreground mt-2">
          Get notes and a quiz from any educational YouTube video.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>YouTube Video Link</CardTitle>
          <CardDescription>
            Paste the URL of the YouTube video you want to process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="youtube-url-input">Video URL</Label>
            <Input
              id="youtube-url-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading || !user}
            />
             {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to generate notes from a video.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !videoUrl.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating...' : 'Generate Notes & Quiz'}
          </Button>
        </CardFooter>
      </Card>

      {generatedContent && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Generated Notes</CardTitle>
              <CardDescription>
                Here are the notes from the video.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
                {generatedContent.notes}
              </div>
            </CardContent>
             <CardFooter className="gap-2">
              <Button variant="outline" onClick={handleSaveNotes}>
                <Save className="mr-2 h-4 w-4" /> Save Notes
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share Notes
              </Button>
            </CardFooter>
          </Card>
          
          {generatedContent.quiz && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Quiz</CardTitle>
                 <CardDescription>
                    Test your knowledge with this AI-generated quiz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {generatedContent.quiz}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" onClick={handleSaveQuiz}>
                  <Save className="mr-2 h-4 w-4" /> Save Quiz
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Quiz
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
