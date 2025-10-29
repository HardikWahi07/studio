
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PexelsImage } from '@/components/pexels-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Hotel, Calendar, Users, Briefcase, Train, Bus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';

type BookingOption = PlanTripOutput['bookingOptions'][number];

type Trip = PlanTripOutput & {
    id: string;
    destination: string;
    origin: string;
    tripTitle: string;
    startDate: string;
    travelers: number;
    status?: 'Booked' | 'Pending';
    createdAt: any;
};

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="w-4 h-4" />,
    train: <Train className="w-4 h-4" />,
    bus: <Bus className="w-4 h-4" />,
    driving: <Bus className="w-4 h-4" />, // Fallback icon
}

export default function MyTripsPage() {
    const t = useTranslations('MyTripsPage');
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const locale = useLocale();

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);
    
    const isLoading = isUserLoading || isLoadingTrips;
    
    const getPrimaryTransport = (trip: Trip): BookingOption | undefined => {
        if (trip.bookingOptions && trip.bookingOptions.length > 0) {
            return trip.bookingOptions.find(opt => opt.type === 'flight') || trip.bookingOptions[0];
        }
        return undefined;
    }


    if (isLoading) {
        return (
            <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-40 w-full" />
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-10 w-full mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        )
    }

     if (!user) {
        return (
            <main className="flex-1 p-4 md:p-8">
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Please Log In</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You need to be logged in to view your planned trips.
                    </p>
                </Card>
            </main>
        )
    }

    if (!trips?.length) {
        return (
             <main className="flex-1 p-4 md:p-8">
                <div className="space-y-2">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground max-w-2xl">{t('description')}</p>
                </div>
                <Card className="mt-8 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">{t('noTripsTitle')}</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        {t('noTripsDescription')}
                    </p>
                     <Button asChild className="mt-4">
                        <Link href="/trip-planner">Plan a New Trip</Link>
                    </Button>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl">
                    {t('description')}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trips.map(trip => {
                    const primaryTransport = getPrimaryTransport(trip);
                    return (
                    <Card key={trip.id} className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
                        <div className="block group">
                            <CardHeader className="p-0">
                                <div className="aspect-video w-full relative">
                                    <PexelsImage query={trip.destination} alt={trip.destination} fill className="rounded-t-lg object-cover"/>
                                     {trip.status === 'Booked' && (
                                        <Badge variant="secondary" className="absolute top-2 right-2 bg-green-600 text-white gap-1"><CheckCircle className="w-3 h-3"/>Booked</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{trip.tripTitle || trip.destination}</CardTitle>
                                    <CardDescription>{t('from', { origin: trip.origin })}</CardDescription>
                                    <div className="space-y-3 text-sm text-muted-foreground mt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(trip.startDate), 'PPP')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{t('travelers', { count: trip.travelers })}</span>
                                        </div>
                                        {primaryTransport && (
                                            <div className="flex items-center gap-2">
                                                {transportIcons[primaryTransport.type]}
                                                <span>{primaryTransport.provider} - {primaryTransport.price} ({primaryTransport.duration})</span>
                                            </div>
                                        )}
                                        {trip.hotelOptions && trip.hotelOptions[0] && (
                                            <div className="flex items-center gap-2">
                                                <Hotel className="w-4 h-4" />
                                                <span>{trip.hotelOptions[0].name} - {trip.hotelOptions[0].pricePerNight}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                     <Button asChild className="flex-1">
                                        <Link href={`/${locale}/my-trips/${trip.id}`}>View Itinerary</Link>
                                    </Button>
                                     <Button asChild variant="outline" className="flex-1">
                                        <Link href={`/${locale}/my-trips/${trip.id}/book`}>Suggest Bookings</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                    )
                })}
            </div>
        </main>
    );
}
