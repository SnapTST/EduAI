'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { parseMcqQuiz } from '@/ai/flows/parse-mcq-quiz';
import type { McqQuestion } from '@/ai/flows/parse-mcq-quiz';
import { Progress } from '../ui/progress';

type GameState = 'setup' | 'playing' | 'results';

export default function McqGameModeTool() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizText, setQuizText] = useState('');
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState>('setup');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleStartGame = async () => {
    if (!quizText.trim()) {
      toast({
        title: 'Quiz Text Required',
        description: 'Please paste the text of your quiz to start the game.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to play the game.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await parseMcqQuiz({ quizText });
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setGameState('playing');
        // Reset game state
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        toast({
          title: 'Parsing Error',
          description: 'Could not find any questions in the text. Please check the format.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to parse the quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setGameState('results');
    }
  };
  
  const handleRestart = () => {
    setGameState('setup');
    setQuizText('');
    setQuestions([]);
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline">MCQ Game Mode</h1>
           <p className="text-muted-foreground mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full" />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.answer;
              const isSelected = option === selectedAnswer;
              let buttonVariant: "outline" | "secondary" | "default" = "outline";
              let icon = null;

              if(isAnswered) {
                if (isCorrect) {
                  buttonVariant = "default";
                  icon = <CheckCircle2 className="text-green-500" />;
                } else if (isSelected && !isCorrect) {
                  buttonVariant = "default";
                   icon = <XCircle className="text-red-500" />;
                } else {
                  buttonVariant = "secondary";
                }
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  variant={buttonVariant}
                  className="w-full justify-start h-auto py-3 text-left"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1 whitespace-pre-wrap">{option}</div>
                    {isSelected && icon && <div className="ml-4">{icon}</div>}
                  </div>
                </Button>
              );
            })}
          </CardContent>
          {isAnswered && (
             <CardFooter>
                <Button onClick={handleNextQuestion} className="w-full">
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  if (gameState === 'results') {
     return (
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold font-headline">Game Over!</h1>
         <p className="text-muted-foreground mt-2">
            Here are your results.
          </p>
        <Card>
          <CardHeader>
             <CardTitle>Final Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <p className="text-6xl font-bold text-primary">
                {score} / {questions.length}
              </p>
               <p className="text-2xl text-muted-foreground">
                ({((score / questions.length) * 100).toFixed(0)}%)
              </p>
          </CardContent>
           <CardFooter className="justify-center">
              <Button onClick={handleRestart}>Play Another Quiz</Button>
           </CardFooter>
        </Card>
      </div>
     )
  }

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
          <CardTitle>Let's Play!</CardTitle>
          <CardDescription>
            Generate a quiz using the "Quiz Generator" tool and paste the text below to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="quiz-text-area">Quiz Text</Label>
            <Textarea
              id="quiz-text-area"
              placeholder="Paste your quiz text here..."
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
              className="min-h-[200px] text-base"
              disabled={isLoading || !user}
            />
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to start a game.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartGame} disabled={isLoading || !quizText.trim() || !user}>
            {isLoading && <LoadingSpinner className="mr-2" />}
            {isLoading ? 'Setting up...' : 'Start Game'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
