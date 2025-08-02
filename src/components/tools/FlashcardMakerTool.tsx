'use client';

import { useState } from 'react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import type { Flashcard } from '@/ai/flows/generate-flashcards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2, Copy, Orbit } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

function FlashcardViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [flippedStates, setFlippedStates] = useState<boolean[]>(Array(flashcards.length).fill(false));

  const handleFlip = (index: number) => {
    setFlippedStates(prev => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((card, index) => (
        <div
          key={index}
          className="relative w-full h-56 perspective-1000"
          onClick={() => handleFlip(index)}
        >
          <div
            className={cn(
              "absolute w-full h-full transition-transform duration-700 transform-style-preserve-3d rounded-lg shadow-lg cursor-pointer",
              { "rotate-y-188": flippedStates[index] }
            )}
            style={{ transform: flippedStates[index] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front of the card */}
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-card border rounded-lg">
              <p className="text-center text-lg font-semibold">{card.front}</p>
            </div>
            {/* Back of the card */}
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-primary/10 border rounded-lg rotate-y-180" style={{ transform: 'rotateY(180deg)' }}>
              <p className="text-center text-base">{card.back}</p>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}


export default function FlashcardMakerTool() {
  const { user } = useAuth();
  const [studyMaterial, setStudyMaterial] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!studyMaterial.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please provide some study material to generate flashcards.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate flashcards.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setFlashcards([]);
    try {
      const result = await generateFlashcards({ studyMaterial });
      setFlashcards(result.flashcards);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate flashcards. Please try again.',
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
        <h1 className="text-4xl font-bold font-headline">AI Flashcard Maker</h1>
        <p className="text-muted-foreground mt-2">
          Turn your study materials into interactive flashcards automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Study Material</CardTitle>
          <CardDescription>
            Paste the text you want to turn into flashcards below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="study-material-textarea">Study Material</Label>
            <Textarea
              id="study-material-textarea"
              placeholder="Paste your notes or any text here..."
              value={studyMaterial}
              onChange={(e) => setStudyMaterial(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to generate flashcards.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !studyMaterial.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Generating Flashcards...' : 'Generate Flashcards'}
          </Button>
        </CardFooter>
      </Card>

      {flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Flashcards</CardTitle>
            <CardDescription>
              Click on any card to flip it and reveal the answer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlashcardViewer flashcards={flashcards} />
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