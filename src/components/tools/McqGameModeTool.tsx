'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2 } from 'lucide-react';

export default function McqGameModeTool() {
  const { toast } = useToast();

  const handleStartGame = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The MCQ Game Mode is currently under development. Stay tuned!',
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">MCQ Game Mode</h1>
        <p className="text-muted-foreground mt-2">
          Turn any quiz into a fun, interactive game to make learning exciting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Play?</CardTitle>
          <CardDescription>
            This feature will convert quizzes from your other tools into a gamified experience with scores and leaderboards.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-12">
            <Gamepad2 className="h-24 w-24 text-primary/50" />
            <p className="text-lg text-muted-foreground">The game is about to begin...</p>
          <Button onClick={handleStartGame} size="lg">
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
