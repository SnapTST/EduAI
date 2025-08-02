
'use client';

import { useState } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function TextToVoiceTool() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to convert to speech.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate audio.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAudioDataUri(null);
    try {
      const result = await textToSpeech({ text });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Text-to-Voice Reading</h1>
        <p className="text-muted-foreground mt-2">
          Convert your notes and other text into listenable audio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Text</CardTitle>
          <CardDescription>
            Paste the text you want to convert into speech.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="text-input">Text to convert</Label>
            <Textarea
              id="text-input"
              placeholder="Paste your notes here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to convert text to speech.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !text.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating Audio...' : 'Generate Audio'}
          </Button>
        </CardFooter>
      </Card>

      {audioDataUri && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
            <CardDescription>
              Listen to the audio generated from your text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <audio controls src={audioDataUri} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
