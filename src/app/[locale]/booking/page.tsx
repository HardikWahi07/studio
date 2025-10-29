
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, CheckCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

type LocalBooking = {
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

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('bookedAt', 'desc')
        );
    }, [user, firestore]);

    const { data: localBookings, isLoading: isLoadingBookings } = useCollection<LocalBooking>(bookingsQuery);

    const isLoading = isUserLoading || isLoadingBookings;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='space-y-6'>
                    <Skeleton className="h-48 w-full" />
                </div>
            );
        }

        if (!localBookings?.length) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Bookings Yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Connect with a local supporter to book a ride or experience. Your confirmed bookings will appear here.
                    </p>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                {localBookings && localBookings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Booked Local Experiences</CardTitle>
                            <CardDescription>Here are the experiences and rides you've confirmed with local supporters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {localBookings.map(booking => (
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
                    <Briefcase /> My Bookings
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Manage all your confirmed rides and experiences with local supporters.
                </p>
            </div>
            {renderContent()}
        </main>
    );
}

    