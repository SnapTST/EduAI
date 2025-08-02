
'use client';

import { useState, useRef, useEffect } from 'react';
import { transcribeAndSummarize } from '@/ai/flows/transcribe-and-summarize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2, Mic, StopCircle, Upload, FileAudio, AlertTriangle } from 'lucide-react';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSavedContent } from '@/hooks/use-saved-content';

type RecordingStatus = 'idle' | 'recording' | 'stopped';

export default function VoiceToTextNotesTool() {
  const { user } = useAuth();
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { saveContent } = useSavedContent();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an audio file smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setAudioDataUri(result);
        setAudioUrl(result);
        setSummary('');
        setTranscription('');
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    setSummary('');
    setTranscription('');
    setAudioUrl(null);
    setAudioDataUri(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          const reader = new FileReader();
          reader.onloadend = () => {
            setAudioDataUri(reader.result as string);
          };
          reader.readAsDataURL(audioBlob);
           // Stop all media tracks to turn off the recording indicator
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setRecordingStatus('recording');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access in your browser settings to record audio.',
          variant: 'destructive',
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('stopped');
    }
  };


  const handleSubmit = async () => {
    if (!audioDataUri) {
      toast({
        title: 'Audio Required',
        description: 'Please record or upload an audio file to generate notes.',
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
    setSummary('');
    setTranscription('');
    try {
      const result = await transcribeAndSummarize({ audioDataUri });
      setSummary(result.summary);
      setTranscription(result.transcription);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to process audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!summary && !transcription) return;
    const fullContent = `## Summary\n\n${summary}\n\n## Transcription\n\n${transcription}`;
    const success = saveContent({
      title: `Notes from Audio`,
      tool: 'Voice-to-Text Notes',
      content: fullContent,
    });
    toast({
      title: success ? 'Notes Saved!' : 'Failed to Save',
      description: success
        ? 'Your notes have been saved to the dashboard.'
        : 'There was an issue saving your notes.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Voice-to-Text Notes</h1>
        <p className="text-muted-foreground mt-2">
          Record your thoughts or upload audio to get them transcribed and summarized.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record or Upload Audio</CardTitle>
          <CardDescription>
            Record directly from your microphone or upload an audio file (e.g., MP3, WAV).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {recordingStatus !== 'recording' ? (
                <Button onClick={startRecording} disabled={isLoading || !user}>
                    <Mic className="mr-2 h-5 w-5" /> Start Recording
                </Button>
            ) : (
                <Button onClick={stopRecording} variant="destructive">
                    <StopCircle className="mr-2 h-5 w-5 animate-pulse" /> Stop Recording
                </Button>
            )}

            <div className="flex items-center text-sm text-muted-foreground">
                <hr className="flex-grow border-t" />
                <span className="mx-2">OR</span>
                <hr className="flex-grow border-t" />
            </div>

             <Button asChild variant="outline" disabled={isLoading || !user}>
                <Label htmlFor="audio-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-5 w-5" /> Upload File
                    <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="sr-only"
                        disabled={isLoading || !user}
                    />
                </Label>
             </Button>
          </div>
          
           {!user && (
              <p className="text-sm text-center text-destructive pt-4">
                Please sign in to use this feature.
              </p>
            )}

          {audioUrl && (
            <div className="pt-4 space-y-2">
                <Label>Audio Preview</Label>
                <audio src={audioUrl} controls className="w-full" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !audioDataUri || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating Notes...' : 'Generate Notes'}
          </Button>
        </CardFooter>
      </Card>

      {(summary || transcription) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Notes</CardTitle>
            <CardDescription>
              Here is the summary and transcription of your audio recording.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div>
              <Label className='text-lg'>Summary</Label>
              <Textarea
                readOnly
                value={summary}
                className="min-h-[200px] text-base bg-muted mt-2"
              />
            </div>
             <div>
              <Label className='text-lg'>Full Transcription</Label>
              <Textarea
                readOnly
                value={transcription}
                className="min-h-[200px] text-base bg-muted mt-2"
              />
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
