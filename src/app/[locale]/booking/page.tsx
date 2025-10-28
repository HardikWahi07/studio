'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, CheckCircle, Ticket, Users, Plane, ArrowLeft, Loader2, Lock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { BookingOption } from '@/ai/flows/plan-trip.types';

type Trip = {
    id: string;
    destination: string;
    tripTitle: string;
    startDate: string;
    bookingOptions?: BookingOption[];
    status?: 'Booked' | 'Pending';
};

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
    const locale = useLocale();
    const router = useRouter();
    const { toast } = useToast();

    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

    const { data: trips, isLoading: isLoadingTrips, forceRefetch: forceRefetchTrips } = useCollection<Trip>(tripsQuery);
    const { data: localBookings, isLoading: isLoadingBookings } = useCollection<LocalBooking>(bookingsQuery);

    const isLoading = isUserLoading || isLoadingTrips || isLoadingBookings;

    const handleSelectTrip = (tripId: string) => {
        const trip = trips?.find(t => t.id === tripId);
        setSelectedTrip(trip || null);
    };

    const calculateTotalCost = () => {
        if (!selectedTrip?.bookingOptions) return '0.00';
        const total = selectedTrip.bookingOptions.reduce((acc: number, option: BookingOption) => {
            const price = parseFloat(option.price.replace(/[^0-9.-]+/g, ""));
            return acc + (isNaN(price) ? 0 : price);
        }, 0);
        return total.toFixed(2);
    }
    
    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrip || !user || !firestore) return;
        
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const tripDocRef = doc(firestore, 'users', user.uid, 'trips', selectedTrip.id);
            await updateDoc(tripDocRef, {
                status: 'Booked'
            });
            toast({
                title: 'Booking Confirmed!',
                description: `Your trip to ${selectedTrip.destination} is now booked.`,
            });
            if (forceRefetchTrips) forceRefetchTrips();
        } catch (error) {
            console.error("Failed to update trip status:", error);
            toast({
                title: 'Booking Failed',
                description: 'Could not update your trip status. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
            setIsBookingModalOpen(false);
            setSelectedTrip(null);
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className='space-y-6'>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            );
        }

        if (!trips?.length && !localBookings?.length) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Trips or Bookings Yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Plan a trip or book a local experience to manage your bookings here.
                    </p>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                {trips && trips.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Plane /> Book Commercial Travel</CardTitle>
                            <CardDescription>Select one of your saved trips to proceed with booking flights, hotels, and transport.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Select onValueChange={handleSelectTrip} value={selectedTrip?.id ?? ""}>
                                <SelectTrigger className="w-full md:w-1/2">
                                    <SelectValue placeholder="Select a trip to book..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips.map(trip => (
                                        <SelectItem key={trip.id} value={trip.id} disabled={trip.status === 'Booked'}>
                                            <div className='flex justify-between w-full'>
                                                <span>{trip.tripTitle || trip.destination}</span>
                                                {trip.status === 'Booked' && <span className='text-xs text-green-600 font-semibold'>BOOKED</span>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedTrip && (
                                <Card className='mt-4'>
                                    <CardHeader>
                                        <CardTitle className='text-lg'>Booking Summary for {selectedTrip.tripTitle}</CardTitle>
                                        <CardDescription>Review your trip components below.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {selectedTrip.bookingOptions?.map((opt: BookingOption, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-secondary rounded-md text-sm">
                                                <div>
                                                    <p className="font-semibold">{opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}: {opt.provider}</p>
                                                    <p className="text-xs text-muted-foreground">{opt.details}</p>
                                                </div>
                                                <p className="font-bold">{opt.price}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter className='flex-col items-start gap-4'>
                                         <div className="border-t pt-4 w-full flex justify-between items-center font-bold text-lg">
                                            <span>Total Cost:</span>
                                            <span>${calculateTotalCost()}</span>
                                        </div>
                                        <Button onClick={() => setIsBookingModalOpen(true)} disabled={selectedTrip.status === 'Booked'}>
                                            {selectedTrip.status === 'Booked' ? 'Trip Already Booked' : 'Proceed to Book'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                )}

                {localBookings && localBookings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Booked Local Experiences</CardTitle>
                            <CardDescription>Here are the experiences you've confirmed with local supporters.</CardDescription>
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
        <>
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><CreditCard /> Secure Payment Simulation</DialogTitle>
                         <DialogDescription>
                            Confirm payment for your trip to <span className='font-bold'>{selectedTrip?.destination}</span>. This is a simulation and no real charges will be made.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConfirmBooking} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" placeholder="**** **** **** 1234" defaultValue="4242 4242 4242 4242" />
                        </div>
                            <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="expiry">Expiry</Label>
                                <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" defaultValue="123" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input id="cardName" placeholder="John Doe" defaultValue="John Doe" />
                        </div>

                        <DialogFooter className='pt-4'>
                            <Button variant="ghost" onClick={() => setIsBookingModalOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button type="submit" className="w-full sm:w-auto" disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Confirm & Pay ${calculateTotalCost()}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


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
        </>
    );
}
