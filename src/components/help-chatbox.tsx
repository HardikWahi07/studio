'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHelpChatResponse } from '@/ai/flows/get-help-chat-response';
import { Avatar, AvatarFallback } from './ui/avatar';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function HelpChatbox({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hi! I'm the TripMind Support Bot. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewportRef = useRef<HTMLDivElement>(null);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getHelpChatResponse({
                history: newMessages.slice(0, -1), // Pass the history *before* the user's latest message
                query: input,
            });
            const modelMessage: Message = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
      // Auto-scroll to the bottom when new messages are added
      if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
      }
    }, [messages]);


    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 h-[28rem] flex flex-col shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground p-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bot /> Help Center
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => onOpenChange(false)}>
                        <X />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4" ref={scrollViewportRef}>
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-2.5", message.role === 'user' ? 'justify-end' : '')}>
                                    {message.role === 'model' && (
                                        <Avatar className="w-7 h-7 bg-primary text-primary-foreground">
                                            <AvatarFallback><Bot className="w-4 h-4"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "p-2.5 rounded-lg max-w-[85%] text-sm shadow-sm",
                                        message.role === 'user' ? 'bg-secondary text-secondary-foreground rounded-br-none' : 'bg-card text-card-foreground border rounded-bl-none'
                                    )}>
                                        <p>{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="w-7 h-7">
                                            <AvatarFallback><User className="w-4 h-4"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2.5">
                                    <Avatar className="w-7 h-7 bg-primary text-primary-foreground">
                                        <AvatarFallback><Bot className="w-4 h-4"/></AvatarFallback>
                                    </Avatar>
                                    <div className="p-2.5 rounded-lg bg-card border">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t">
                    <form onSubmit={handleSend} className="flex w-full gap-2">
                        <Input
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}