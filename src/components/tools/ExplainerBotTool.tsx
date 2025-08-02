'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { explainTopic } from '@/ai/flows/explain-topic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Send, User, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ExplainerBotTool() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A workaround to scroll to the bottom of the scroll area
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use the explainer bot.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await explainTopic({ topic: input });
      const botMessage: Message = { sender: 'bot', text: response.explanation };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: 'Error',
        description: 'Failed to get explanation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">AI Explainer Bot</h1>
        <p className="text-muted-foreground mt-2">
          Your personal AI tutor. Ask anything, get simple explanations.
        </p>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Ask a question about any topic you're struggling with.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                        <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  {message.sender === 'user' && user && (
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0) || <User />}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                        <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md p-3 rounded-lg bg-muted flex items-center">
                        <LoadingSpinner className="h-5 w-5" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Explain the theory of relativity..."
              className="flex-grow"
              disabled={isLoading || !user}
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !user} size="icon">
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          {!user && (
              <p className="text-sm text-center text-destructive mt-2">
                Please sign in to chat with the AI Explainer Bot.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
