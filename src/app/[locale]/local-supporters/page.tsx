'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, MapPin, Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { findLocalSupporters, type LocalSupporter } from '@/ai/flows/find-local-supporters';

type Trip = {
    id: string;
    destination: string;
    startDate: string; // Assuming 'YYYY-MM-DD'
};


export default function LocalSupportersPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [searchLocation, setSearchLocation] = useState('');
    const [supporters, setSupporters] = useState<LocalSupporter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTripDestination, setCurrentTripDestination] = useState<string | null>(null);

    // Find the user's most recent upcoming trip
    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        const today = new Date().toISOString().split('T')[0];
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            where('startDate', '>=', today),
            orderBy('startDate', 'asc'),
            limit(1)
        );
    }, [user, firestore]);

    const { data: upcomingTrips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);

    // Function to fetch supporters
    const fetchSupporters = async (location: string) => {
        if (!location) return;
        setIsLoading(true);
        setSupporters([]);
        try {
            const result = await findLocalSupporters({ location });
            setSupporters(result.supporters);
            if (result.supporters.length === 0) {
                 toast({
                    title: `No Supporters Found in ${location}`,
                    description: "We couldn't find any AI supporters for that location. Try a different city.",
                });
            }
        } catch (error) {
            console.error("Failed to fetch supporters:", error);
            toast({
                title: "Error",
                description: "Failed to fetch local supporters. Please try again.",
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Effect to automatically search if an upcoming trip is found
    useEffect(() => {
        if (upcomingTrips && upcomingTrips.length > 0) {
            const destination = upcomingTrips[0].destination;
            setCurrentTripDestination(destination);
            setSearchLocation(destination);
            fetchSupporters(destination);
        }
    }, [upcomingTrips]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSupporters(searchLocation);
    }

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-col items-center text-center pt-6">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="space-y-2 mt-4 w-full">
                                    <Skeleton className="h-5 w-3/4 mx-auto" />
                                    <Skeleton className="h-4 w-1/2 mx-auto" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                             <CardFooter className="flex-col gap-4 items-start">
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }

        if (!supporters?.length) {
            return (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Find Local Supporters</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       Enter a location above to find AI-powered local supporters in that area.
                    </p>
                </Card>
            );
        }

        return (
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
                        <CardFooter className="flex-col gap-4 items-start">
                            <Button className="w-full" variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <>
            <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <div className="space-y-2">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">Local Supporters</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Connect with friendly AI locals who are happy to help. Get tips, ask questions, or just get a friendly suggestion when you're feeling lost.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Find a Supporter</CardTitle>
                        <CardDescription>
                            {currentTripDestination 
                                ? `Automatically showing results for your upcoming trip to ${currentTripDestination}. You can search for a different city below.`
                                : "Enter a city to AI locals who can help."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input 
                                placeholder="e.g., Madrid, Spain"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin"/> : <Search className="h-4 w-4" />}
                                <span className="ml-2 hidden sm:inline">Search</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {renderContent()}
            </main>
        </>
    );
}
// final commit
