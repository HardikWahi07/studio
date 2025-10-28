
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PexelsImage } from '@/components/pexels-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Hotel, Calendar, Users, Briefcase, Train, Bus } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

type BookingOption = {
    type: 'flight' | 'train' | 'bus';
    provider: string;
    details: string;
    duration: string;
    price: string;
};

type Trip = {
    id: string;
    destination: string;
    origin: string;
    startDate: string;
    travelers: number;
    hotel?: { name: string; location: string; pricePerNight: string };
    transport?: BookingOption;
    bookingOptions?: BookingOption[];
};

const transportIcons = {
    flight: <Plane className="w-4 h-4" />,
    train: <Train className="w-4 h-4" />,
    bus: <Bus className="w-4 h-4" />,
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
        if (trip.transport) return trip.transport;
        if (trip.bookingOptions && trip.bookingOptions.length > 0) {
            return trip.bookingOptions.find(opt => opt.type === 'flight') || trip.bookingOptions[0];
        }
        return undefined;
    }


    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl">
                    {t('description')}
                </p>
            </div>

            {isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-40 w-full" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {!isLoading && !trips?.length && (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">{t('noTripsTitle')}</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        {t('noTripsDescription')}
                    </p>
                </Card>
            )}

            {!isLoading && trips && trips.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {trips.map(trip => {
                        const primaryTransport = getPrimaryTransport(trip);
                        return (
                        <Link key={trip.id} href={`/${locale}/my-trips/${trip.id}`} className="block group">
                            <Card className="flex flex-col h-full transition-shadow duration-300 group-hover:shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="aspect-video w-full relative">
                                        <PexelsImage query={trip.destination} alt={trip.destination} fill className="rounded-t-lg object-cover"/>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{trip.destination}</CardTitle>
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
                                            {trip.hotel && (
                                                <div className="flex items-center gap-2">
                                                    <Hotel className="w-4 h-4" />
                                                    <span>{trip.hotel.name} - {trip.hotel.pricePerNight}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )})}
                </div>
            )}
        </main>
    );
}
