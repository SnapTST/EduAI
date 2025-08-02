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

export default function ExamBuilderTool() {
  const { user } = useAuth();
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    setExamQuestions([]);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!photoDataUri) {
      toast({
        title: 'Image Required',
        description: 'Please upload an image to generate exam questions.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to build an exam.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setExamQuestions([]);
    try {
      const result = await extractTextAndGenerateExamQuestions({ photoDataUri });
      setExamQuestions(result.examQuestions);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate exam questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveToDrive = () => {
    toast({ title: "Coming Soon!", description: "Google Drive integration is under development." });
  }
  
  const handleSaveToTerabox = () => {
    toast({ title: "Coming Soon!", description: "TeraBox integration is under development." });
  }

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Exam Builder</h1>
        <p className="text-muted-foreground mt-2">
          Upload a photo of your notes or textbook to create practice exam questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Material</CardTitle>
          <CardDescription>
            Choose an image file (PNG, JPG, etc.) of your study material.
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
                    alt="Uploaded material preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full h-8 w-8 z-10"
                    onClick={clearImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
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
                Please sign in to upload an image and build an exam.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !photoDataUri || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Building Exam...' : 'Generate Exam Questions'}
          </Button>
        </CardFooter>
      </Card>

      {examQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Exam Questions</CardTitle>
            <CardDescription>
              Here are some potential questions based on your material.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 list-decimal list-inside bg-muted p-6 rounded-md">
              {examQuestions.map((q, index) => (
                <li key={index} className="prose dark:prose-invert max-w-none">{q}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={handleSaveToDrive}>
              <Save className="mr-2 h-4 w-4" /> Save to Google Drive
            </Button>
            <Button variant="outline" onClick={handleSaveToTerabox}>
                <ImageIcon className="mr-2 h-4 w-4" /> Save Image to TeraBox
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
