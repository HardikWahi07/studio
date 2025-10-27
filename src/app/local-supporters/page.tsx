
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Languages, MapPin, Users } from 'lucide-react';

type LocalSupporter = {
    id: string;
    name: string;
    bio: string;
    location: string;
    languages: string[];
    avatarUrl: string;
    response_time: string;
};

export default function LocalSupportersPage() {
    const firestore = useFirestore();

    const supportersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'supporters'), orderBy('name'));
    }, [firestore]);

    const { data: supporters, isLoading: isLoadingSupporters } = useCollection<LocalSupporter>(supportersQuery);
    
    const isLoading = isLoadingSupporters;

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">Local Supporters</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Connect with friendly locals who are happy to help. Get advice, ask questions, or just get a friendly tip when you're feeling lost.
                </p>
            </div>

            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            
            {!isLoading && !supporters?.length && (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Supporters Found</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       We're still building our network of local supporters. Check back soon!
                    </p>
                </Card>
            )}

            {!isLoading && supporters && supporters.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {supporters.map(supporter => (
                        <Card key={supporter.id} className="flex flex-col">
                            <CardHeader className="flex flex-col items-center text-center pt-6">
                                <Avatar className="h-24 w-24 border-4 border-primary/20">
                                    <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                                    <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="font-headline text-xl mt-4">{supporter.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {supporter.location}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-muted-foreground flex-grow">
                                <p>{supporter.bio}</p>
                                
                                <div className="flex flex-wrap gap-2 justify-center pt-4">
                                    {supporter.languages.map(lang => (
                                        <Badge key={lang} variant="secondary">{lang}</Badge>
                                    ))}
                                </div>
                                
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3 h-3"/> Responds: {supporter.response_time}
                                </div>
                                <Button className="w-full">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
