
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';
import { TripItinerary } from '@/components/trip-itinerary';
import { ArrowLeft, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';


export default function TripDetailsPage({ params: { tripId } }: { params: { tripId: string } }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const locale = useLocale();

    const tripDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !tripId) return null;
        return doc(firestore, 'users', user.uid, 'trips', tripId);
    }, [user, firestore, tripId]);

    const { data: trip, isLoading: isLoadingTrip } = useDoc<PlanTripOutput & { tripTitle: string }>(tripDocRef);

    const isLoading = isUserLoading || isLoadingTrip;

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="container mx-auto">
                 <Button asChild variant="outline" className="mb-4">
                    <Link href={`/${locale}/my-trips`}>
                        <ArrowLeft className="mr-2" />
                        Back to My Trips
                    </Link>
                </Button>

                {isLoading && (
                   <div className="space-y-6">
                        <Skeleton className="h-10 w-2/3 mx-auto" />
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {!isLoading && !trip && (
                    <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                        <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 font-bold text-lg">Trip Not Found</h3>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            We couldn't find the trip you're looking for. It might have been moved or deleted.
                        </p>
                    </Card>
                )}

                {!isLoading && trip && (
                    <div className="pt-6 space-y-6">
                         <div className="text-center">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold">{trip.tripTitle}</h2>
                        </div>
                        <TripItinerary results={trip} />
                    </div>
                )}
            </div>
        </main>
    )
}
