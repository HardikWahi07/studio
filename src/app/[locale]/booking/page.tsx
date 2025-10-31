'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, CheckCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type LocalBooking = {
    id: string;
    supporterName: string;
    experience: string;
    day: string;
    time: string;
    userId: string;
    bookedAt: {
        toDate: () => Date;
    };
};

export default function BookingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Fetch all bookings where the current user is the participant.
    // The security rules ensure this query is safe.
    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'bookings')
        );
    }, [user, firestore]);
    
    const { data: allBookings, isLoading: isLoadingBookings } = useCollection<LocalBooking>(bookingsQuery);

    const userBookings = useMemo(() => {
        if (!user || !allBookings) return [];
        return allBookings.filter(booking => booking.userId === user.uid);
    }, [user, allBookings]);


    const isLoading = isUserLoading || isLoadingBookings;

    if (isLoading) {
        return (
            <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
            </main>
        );
    }
    
    if (!user) {
        return (
            <main className="flex-1 p-4 md:p-8">
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Please Log In</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You need to be logged in to view and manage your bookings.
                    </p>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">
                     My Bookings
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Manage all your confirmed journeys and experiences with local supporters.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Booked Local Experiences</CardTitle>
                    <CardDescription>Here are the experiences you've confirmed with local supporters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {userBookings.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                            <h3 className="mt-4 font-bold text-lg">No Local Bookings Yet</h3>
                            <p className="mt-2 text-muted-foreground max-w-sm">
                                Connect with a local supporter to book an experience. Your confirmed bookings will appear here.
                            </p>
                            <Button asChild className="mt-4"><Link href="/local-supporters">Find Supporters</Link></Button>
                        </div>
                    )}
                    {userBookings.map(booking => (
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

             <div className="pt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Trip Bookings</CardTitle>
                        <CardDescription>
                            View your saved itineraries to book flights, hotels, and more.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/my-trips">Go to My Trips</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
