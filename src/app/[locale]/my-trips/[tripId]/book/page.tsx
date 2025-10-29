
'use client';

import React, { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlanTripOutput, BookingOption, HotelOption } from '@/ai/flows/plan-trip.types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Plane, Train, Bus, Leaf, Hotel, Star, Clock, CarFront, CheckCircle, ShoppingCart, Award, BadgeEuro, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type TripData = PlanTripOutput & { tripTitle: string; destination: string; status?: 'Booked' | 'Pending' };

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="h-6 w-6 text-sky-500" />,
    train: <Train className="h-6 w-6 text-purple-500" />,
    bus: <Bus className="h-6 w-6 text-orange-500" />,
    driving: <CarFront className="h-6 w-6 text-gray-500" />,
};

function BookingOptionCard({ opt, recommendation }: { opt: BookingOption, recommendation?: 'Best' | 'Cheapest' | 'Eco-Friendly' }) {
    const { toast } = useToast();
    
    const handleBook = () => {
        toast({
            title: "Opening Booking Site",
            description: `Redirecting to ${opt.provider} to complete your booking.`,
        });
    }

    const recommendationBadges = {
        'Best': <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200"><Sparkles className="w-3 h-3 mr-1"/>Best Option</Badge>,
        'Cheapest': <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><BadgeEuro className="w-3 h-3 mr-1"/>Cheapest</Badge>,
        'Eco-Friendly': <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>,
    }

    return (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
                {transportIcons[opt.type]}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold">{opt.provider}</p>
                        {recommendation && recommendationBadges[recommendation]}
                    </div>
                    <p className="font-normal text-muted-foreground text-sm">{opt.details}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{opt.duration}</span>
                        {opt.ecoFriendly && !recommendation && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/50"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto ml-auto sm:ml-0">
                <p className="font-bold text-lg">{opt.price}</p>
                <Button asChild className="w-full sm:w-auto" onClick={handleBook}>
                    <Link href={opt.bookingLink} target="_blank">Book</Link>
                </Button>
            </div>
        </Card>
    )
}

function HotelOptionCard({ opt }: { opt: HotelOption }) {
    const { toast } = useToast();
    
    const handleBook = () => {
        toast({
            title: "Opening Hotel Booking Site",
            description: `Redirecting to booking page for ${opt.name}.`,
        });
    }

    return (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
                <Hotel className="h-6 w-6 text-blue-500" />
                <div>
                    <p className="font-bold">{opt.name} <span className="font-normal text-muted-foreground text-sm">{opt.style}</span></p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>{opt.rating}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto ml-auto sm:ml-0">
                <p className="font-bold text-lg">{opt.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                <Button asChild className="w-full sm:w-auto" onClick={handleBook}>
                    <Link href={opt.bookingLink} target="_blank">Book</Link>
                </Button>
            </div>
        </Card>
    )
}

export default function BookTripPage({ params: paramsPromise }: { params: Promise<{ tripId: string }> }) {
    const params = React.use(paramsPromise);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const locale = useLocale();
    const router = useRouter();
    const { toast } = useToast();
    const tripId = params.tripId;

    const tripDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !tripId) return null;
        return doc(firestore, 'users', user.uid, 'trips', tripId);
    }, [user, firestore, tripId]);

    const { data: trip, isLoading: isLoadingTrip, forceRefetch } = useDoc<TripData>(tripDocRef);

    const isLoading = isUserLoading || isLoadingTrip;

    const sortedBookingOptions = useMemo(() => {
        if (!trip?.bookingOptions) return { best: null, cheapest: null, eco: null, other: [] };
        
        const validOptions = trip.bookingOptions.filter(o => o.price);
        if (validOptions.length === 0) return { best: null, cheapest: null, eco: null, other: [] };

        const parsePrice = (price: string) => parseFloat(price.replace(/[^0-9.]/g, ''));
        const sortedByPrice = [...validOptions].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        
        const cheapest = sortedByPrice[0];
        const eco = validOptions.find(o => o.ecoFriendly && o.provider !== cheapest.provider);
        
        let best = validOptions.find(o => o.type === 'flight' && o.provider !== cheapest.provider && o.provider !== eco?.provider) || null;
        if (!best) {
            best = validOptions.find(o => o.provider !== cheapest.provider && o.provider !== eco?.provider) || null;
        }

        const recommendationProviders = new Set([best?.provider, cheapest?.provider, eco?.provider]);
        const other = validOptions.filter(o => !recommendationProviders.has(o.provider));

        return { best, cheapest, eco, other };
    }, [trip?.bookingOptions]);
    
    const handleConfirmBooking = async () => {
        if (!tripDocRef) return;
        try {
            await updateDoc(tripDocRef, { status: 'Booked' });
            toast({
                title: "Trip Booked!",
                description: "Your trip status has been updated.",
            });
            if (forceRefetch) forceRefetch();
            router.push(`/${locale}/my-trips`);
        } catch(e) {
            toast({
                title: "Update Failed",
                description: "Could not update trip status. Please try again.",
                variant: 'destructive',
            });
        }
    }


    if (isLoading) {
        return (
            <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <div className="container mx-auto">
                    <Skeleton className="h-10 w-36 mb-4" />
                    <Skeleton className="h-12 w-2/3 mb-2" />
                    <Skeleton className="h-6 w-1/3 mb-8" />
                    <div className="space-y-6">
                        <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                    </div>
                </div>
            </main>
        )
    }

    if (!trip) {
        return (
             <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <div className="container mx-auto">
                    <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                        <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 font-bold text-lg">Trip Not Found</h3>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            We couldn't find the trip you're looking for.
                        </p>
                    </Card>
                </div>
            </main>
        )
    }
    
    const isBooked = trip.status === 'Booked';

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <Button asChild variant="outline">
                        <Link href={`/${locale}/my-trips/${tripId}`}>
                            <ArrowLeft className="mr-2" />
                            Back to Itinerary
                        </Link>
                    </Button>
                    {isBooked ? (
                        <div className="inline-flex items-center gap-2 text-green-600 font-semibold bg-green-100 dark:bg-green-900/50 px-4 py-2 rounded-full">
                            <CheckCircle /> This trip is booked
                        </div>
                    ) : (
                         <Button onClick={handleConfirmBooking}>
                            <CheckCircle className="mr-2" />
                            Mark as Booked
                        </Button>
                    )}
                 </div>

                <div className="space-y-2">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2">
                        <ShoppingCart /> Suggested Bookings for {trip.destination}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Here are the AI-suggested options for your trip. Click "Book" to visit the provider's site.
                    </p>
                </div>

                <div className="space-y-8 pt-4">
                    {trip.bookingOptions && trip.bookingOptions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Plane /> Transport to {trip.destination}</CardTitle>
                                <CardDescription>Our AI has found these options for your main travel leg.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {sortedBookingOptions.cheapest && <BookingOptionCard opt={sortedBookingOptions.cheapest} recommendation="Cheapest" />}
                                {sortedBookingOptions.best && <BookingOptionCard opt={sortedBookingOptions.best} recommendation="Best" />}
                                {sortedBookingOptions.eco && <BookingOptionCard opt={sortedBookingOptions.eco} recommendation="Eco-Friendly" />}
                                {sortedBookingOptions.other.map((opt, idx) => <BookingOptionCard key={idx} opt={opt} />)}
                            </CardContent>
                        </Card>
                    )}
                    
                    {trip.hotelOptions && trip.hotelOptions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Hotel /> Hotel Options</CardTitle>
                                <CardDescription>Recommended places to stay based on your preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {trip.hotelOptions.map((opt, idx) => (
                                   <HotelOptionCard key={idx} opt={opt} />
                               ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}
