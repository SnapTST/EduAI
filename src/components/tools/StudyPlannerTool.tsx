
'use client';

import { useState } from 'react';
import { generateStudyPlan } from '@/ai/flows/generate-study-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Save, Share2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useSavedContent } from '@/hooks/use-saved-content';

export default function StudyPlannerTool() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState<number | ''>('');
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveContent } = useSavedContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !goal.trim() || !days) {
      toast({
        title: 'All Fields Required',
        description: 'Please fill out all fields to generate a study plan.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate a study plan.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setPlan(null);
    try {
      const response = await generateStudyPlan({ subject, goal, days: Number(days) });
      setPlan(response.plan);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate study plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!plan) return;
    const success = saveContent({
      title: `Study Plan for ${subject}`,
      tool: 'Study Planner',
      content: plan,
    });
    toast({
      title: success ? 'Plan Saved!' : 'Failed to Save',
      description: success
        ? 'Your study plan has been saved to the dashboard.'
        : 'There was an issue saving your plan.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleShare = () => {
    toast({ title: "Coming Soon!", description: "Sharing feature is under development." });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Study Planner</h1>
        <p className="text-muted-foreground mt-2">
          Create a personalized study schedule to achieve your academic goals.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Your Study Goals</CardTitle>
            <CardDescription>
              Tell us what you want to achieve, and we'll create a plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Physics, History, Calculus"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading || !user}
              />
            </div>
             <div className="grid w-full gap-2">
                <Label htmlFor="goal">What is your goal?</Label>
                <Textarea
                    id="goal"
                    placeholder="e.g., Ace the final exam, Understand Chapter 5 on Thermodynamics, Finish my research paper"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isLoading || !user}
                    className="min-h-[100px]"
                />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="days">How many days do you have to study?</Label>
              <Input
                id="days"
                type="number"
                placeholder="e.g., 7"
                value={days}
                onChange={(e) => setDays(e.target.value ? parseInt(e.target.value, 10) : '')}
                min="1"
                disabled={isLoading || !user}
              />
            </div>
             {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to create a study plan.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !subject || !goal || !days || !user}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              {isLoading ? 'Generating Plan...' : 'Generate My Study Plan'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Study Plan</CardTitle>
            <CardDescription>
              Here is your day-by-day guide to success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
                {plan}
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
