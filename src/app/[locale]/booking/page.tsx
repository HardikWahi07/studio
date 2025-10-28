'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, CheckCircle, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLocale } from 'next-intl';

type Trip = {
    id: string;
    destination: string;
    tripTitle: string;
    startDate: string;
};

type Booking = {
    id: string;
    supporterName: string;
    experience: string;
    day: string;
    time: string;
    bookedAt: {
        toDate: () => Date;
    };
};

export default function BookingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const locale = useLocale();
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('bookedAt', 'desc')
        );
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);
    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

    const isLoading = isUserLoading || isLoadingTrips || isLoadingBookings;

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton className="h-64 w-full" />;
        }

        if (!trips?.length && !bookings?.length) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Trips or Bookings Yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Plan a trip with our AI Trip Planner or book an experience with a Local Supporter to see your bookings here.
                    </p>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                {trips && trips.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Book Flights, Hotels & Transport</CardTitle>
                            <CardDescription>Select one of your saved trips to see booking options.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Select onValueChange={setSelectedTripId} defaultValue={selectedTripId ?? undefined}>
                                <SelectTrigger className="w-full md:w-1/2">
                                    <SelectValue placeholder="Select a trip..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips.map(trip => (
                                        <SelectItem key={trip.id} value={trip.id}>
                                            {trip.tripTitle || trip.destination}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedTripId && (
                                <div className="mt-6">
                                     <Button asChild>
                                        <Link href={`/${locale}/my-trips/${selectedTripId}/book`}>
                                            Proceed to Book Trip Components
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {bookings && bookings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Booked Local Experiences</CardTitle>
                            <CardDescription>Here are the experiences you've confirmed with local supporters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                                    <div className="space-y-1">
                                        <p className="font-bold text-primary">{booking.experience}</p>
                                        <p className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> With {booking.supporterName}</p>
                                        <p className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> {booking.day} at {booking.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Booked</p>
                                        <p className="text-xs text-muted-foreground">on {format(booking.bookedAt.toDate(), 'PPP')}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }


    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2">
                    <Ticket /> My Bookings
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Manage all your trip component bookings and local experiences in one place.
                </p>
            </div>
            {renderContent()}
        </main>
    );
}
    