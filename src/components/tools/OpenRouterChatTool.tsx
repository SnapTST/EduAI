
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { openRouterChat } from '@/ai/flows/openrouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Send, User, Bot, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { useSavedContent } from '@/hooks/use-saved-content';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const openRouterModels = [
    "mistralai/mistral-7b-instruct-v0.2",
    "huggingfaceh4/zephyr-7b-beta",
    "google/gemini-pro",
    "anthropic/claude-2",
    "meta-llama/llama-2-13b-chat",
];

export default function OpenRouterChatTool() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(openRouterModels[0]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { saveContent } = useSavedContent();

  useEffect(() => {
    if (scrollAreaRef.current) {
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
        description: 'Please sign in to use the OpenRouter chat.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await openRouterChat({ 
        model: selectedModel,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })) 
    });
      const botMessage: Message = { role: 'assistant', content: response.message.content };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: 'Error',
        description: 'Failed to get a response from OpenRouter. Please check your API key and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AI Bot'}: ${msg.content}`)
      .join('\n\n');
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const title = lastUserMessage ? `Chat with ${selectedModel}: ${lastUserMessage.content.substring(0,20)}...` : 'OpenRouter Chat';

    saveContent({
      title: title,
      tool: 'OpenRouter Chat',
      content: conversationText,
    });

    toast({
      title: 'Conversation Saved!',
      description: 'The chat has been saved to your dashboard.',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">OpenRouter Chat</h1>
        <p className="text-muted-foreground mt-2">
          Chat with a variety of AI models via the OpenRouter API.
        </p>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader className='flex-row items-center justify-between'>
          <div>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Select a model and start your conversation.
            </CardDescription>
          </div>
           {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleSaveConversation}>
              <Save className="mr-2 h-4 w-4" />
              Save Chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                        <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && user && (
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
           <div className="space-y-4 pt-4 border-t">
             <div className="grid gap-2">
                <Label htmlFor="model-select">Select a Model</Label>
                 <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading || !user}>
                    <SelectTrigger id="model-select">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        {openRouterModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-grow"
                disabled={isLoading || !user}
                />
                <Button type="submit" disabled={isLoading || !input.trim() || !user} size="icon">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
                </Button>
            </form>
           </div>
          {!user && (
              <p className="text-sm text-center text-destructive mt-2">
                Please sign in to chat with OpenRouter models.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
