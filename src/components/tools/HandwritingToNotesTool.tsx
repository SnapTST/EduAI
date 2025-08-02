
'use client';

import { useState } from 'react';
import { extractTextAndGenerateExamQuestions } from '@/ai/flows/extract-text-from-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '../ui/textarea';
import { useSavedContent } from '@/hooks/use-saved-content';

export default function HandwritingToNotesTool() {
  const { user } = useAuth();
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveContent } = useSavedContent();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Genkit media
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setImagePreview(result);
        setPhotoDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setPhotoDataUri(null);
    setExtractedText('');
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!photoDataUri) {
      toast({
        title: 'Image Required',
        description: 'Please upload an image to extract text.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to convert handwriting to notes.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setExtractedText('');
    try {
      // Re-using this flow as it primarily extracts text which is what we need.
      // The extra exam questions can be ignored.
      const result = await extractTextAndGenerateExamQuestions({ photoDataUri });
      setExtractedText(result.extractedText);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to extract text from image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!extractedText) return;
    saveContent({
      title: `Notes from Handwriting`,
      tool: 'Handwriting to Notes',
      content: extractedText,
    });
    toast({
      title: 'Notes Saved!',
      description: 'Your notes have been saved to the dashboard.',
    });
  };

  const handleShare = async () => {
    if (!extractedText) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Notes from EduAI Scholar',
          text: extractedText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(extractedText);
        toast({
          title: 'Copied to Clipboard!',
          description: 'Notes copied. You can now paste them to share.',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Sharing Failed',
        description: 'Could not share the notes.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Handwriting to Notes Converter</h1>
        <p className="text-muted-foreground mt-2">
          Upload a picture of your handwritten notes to get clean, typed text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Notes</CardTitle>
          <CardDescription>
            Choose an image file (PNG, JPG, etc.) of your handwritten notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="image-upload" className="sr-only">Upload Image</Label>
            <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64">
              {!imagePreview && (
                <>
                  <UploadCloud className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Drag & drop an image here, or click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Max file size: 4MB</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading || !user}
                  />
                </>
              )}
              {imagePreview && (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Uploaded notes preview"
                    fill
                    objectFit="contain"
                    className="rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full h-8 w-8 z-10"
                    onClick={clearImage}
                    disabled={isLoading}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {imagePreview && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4"/> Image successfully uploaded and ready.
                </p>
            )}
             {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to upload an image and convert your notes.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !photoDataUri || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Converting...' : 'Convert to Text'}
          </Button>
        </CardFooter>
      </Card>

      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle>Converted Notes</CardTitle>
            <CardDescription>
              Here is the typed version of your handwritten notes. You can edit it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="converted-text" className="sr-only">Converted Text</Label>
            <Textarea
              id="converted-text"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="min-h-[300px] text-base bg-muted"
            />
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
