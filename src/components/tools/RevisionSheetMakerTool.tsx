'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList } from 'lucide-react';

export default function RevisionSheetMakerTool() {
  const { toast } = useToast();

  const handleGenerateSheet = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The Revision Sheet Maker is currently under development. Stay tuned!',
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Revision Sheet Maker</h1>
        <p className="text-muted-foreground mt-2">
          Consolidate all your notes, summaries, and quizzes into one powerful document.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Revise?</CardTitle>
          <CardDescription>
            This feature will scan all your saved content and automatically create a condensed, easy-to-read revision sheet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-12">
            <ClipboardList className="h-24 w-24 text-primary/50" />
            <p className="text-lg text-muted-foreground">Your ultimate study guide is just a click away.</p>
          <Button onClick={handleGenerateSheet} size="lg">
            Generate Revision Sheet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
