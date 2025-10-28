
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { BookingOption } from '@/ai/flows/plan-trip.types';

export default function BookTripPage({ params }: { params: { tripId: string } }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const locale = useLocale();
    const router = useRouter();
    const { toast } = useToast();
    const tripId = React.use(params).tripId;

    const [isProcessing, setIsProcessing] = useState(false);

    const tripDocRef = useMemoFirebase(() => {
        if (!user || !firestore || !tripId) return null;
        return doc(firestore, 'users', user.uid, 'trips', tripId);
    }, [user, firestore, tripId]);

    const { data: trip, isLoading: isLoadingTrip } = useDoc<any>(tripDocRef);

    const isLoading = isUserLoading || isLoadingTrip;

    const calculateTotalCost = () => {
        if (!trip?.bookingOptions) return '0.00';
        const total = trip.bookingOptions.reduce((acc: number, option: BookingOption) => {
            const price = parseFloat(option.price.replace(/[^0-9.-]+/g, ""));
            return acc + (isNaN(price) ? 0 : price);
        }, 0);
        return total.toFixed(2);
    }
    
    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tripDocRef) return;
        
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await updateDoc(tripDocRef, {
                status: 'Booked'
            });
            toast({
                title: 'Booking Confirmed!',
                description: `Your trip to ${trip.destination} is now booked.`,
            });
            router.push(`/${locale}/my-trips`);
        } catch (error) {
            console.error("Failed to update trip status:", error);
            toast({
                title: 'Booking Failed',
                description: 'Could not update your trip status. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    }

    if (isLoading) {
        return (
            <main className="flex-1 p-4 md:p-8">
                <div className="container mx-auto">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </main>
        )
    }

    if (!trip) {
        return (
            <main className="flex-1 p-4 md:p-8">
                 <div className="container mx-auto text-center">
                    <h2 className="text-2xl font-bold">Trip not found</h2>
                    <p className="text-muted-foreground">The trip you are trying to book does not exist.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href={`/${locale}/my-trips`}>
                            <ArrowLeft className="mr-2" />
                            Back to My Trips
                        </Link>
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-8 bg-background">
            <div className="container mx-auto">
                <div className="mb-6">
                     <Button asChild variant="outline" size="sm">
                        <Link href={`/${locale}/my-trips/${tripId}`}>
                            <ArrowLeft className="mr-2" />
                            Back to Itinerary
                        </Link>
                    </Button>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Your Booking</CardTitle>
                                <CardDescription>You are booking a trip to <span className="font-bold">{trip.destination}</span>.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {trip.bookingOptions?.map((opt: BookingOption, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                                        <div>
                                            <p className="font-semibold">{opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}: {opt.provider}</p>
                                            <p className="text-sm text-muted-foreground">{opt.details}</p>
                                        </div>
                                        <p className="font-bold">{opt.price}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                     <div className="lg:col-span-1 sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><CreditCard /> Secure Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleConfirmBooking} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">Card Number</Label>
                                        <Input id="cardNumber" placeholder="**** **** **** 1234" />
                                    </div>
                                     <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="expiry">Expiry</Label>
                                            <Input id="expiry" placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvc">CVC</Label>
                                            <Input id="cvc" placeholder="123" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cardName">Name on Card</Label>
                                        <Input id="cardName" placeholder="John Doe" />
                                    </div>

                                    <div className="border-t pt-4 mt-4 flex justify-between items-center font-bold text-lg">
                                        <span>Total Cost:</span>
                                        <span>${calculateTotalCost()}</span>
                                    </div>

                                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Confirm & Book
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
