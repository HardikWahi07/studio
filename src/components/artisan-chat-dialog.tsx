
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getArtisanChatResponse } from '@/ai/flows/get-artisan-chat-response';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Artisan } from '@/app/[locale]/local-artisans/page';
import { PexelsImage } from './pexels-image';

type Message = {
    role: 'user' | 'model';
    content: string;
};

interface ArtisanChatDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    artisan: Artisan;
}

export function ArtisanChatDialog({ isOpen, onOpenChange, artisan }: ArtisanChatDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewportRef = useRef<HTMLDivElement>(null);

    // Reset state when a new artisan is selected
    useEffect(() => {
        if (isOpen) {
            setMessages([
                { role: 'model', content: `Hello! Welcome to ${artisan.name}. How can I help you today?` }
            ]);
        }
    }, [isOpen, artisan]);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getArtisanChatResponse({
                history: newMessages,
                query: input,
                artisanName: artisan.name,
                artisanDescription: artisan.description
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
      if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
      }
    }, [messages]);


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] flex flex-col h-[90vh] max-h-[700px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-4">
                         <Avatar className="w-12 h-12">
                            <PexelsImage query={artisan.imageHint} alt={artisan.name} width={48} height={48} />
                         </Avatar>
                         <div>
                            <DialogTitle>{artisan.name}</DialogTitle>
                            <DialogDescription>Online</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
                    <div className="p-6 space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-2.5", message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'model' && (
                                    <Avatar className="w-8 h-8">
                                       <PexelsImage query={artisan.imageHint} alt={artisan.name} width={32} height={32} />
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "p-3 rounded-lg max-w-[85%] text-sm shadow-sm",
                                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'
                                )}>
                                    <p>{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><User className="w-4 h-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2.5">
                                <Avatar className="w-8 h-8">
                                     <PexelsImage query={artisan.imageHint} alt={artisan.name} width={32} height={32} />
                                </Avatar>
                                <div className="p-3 rounded-lg bg-secondary">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground"/>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
// final commit
