
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Hotel, Train, Bus, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlanTripOutput, BookingOption } from '@/ai/flows/plan-trip.types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Trip = PlanTripOutput & {
  id: string;
  destination: string;
};

const transportIcons: { [key: string]: React.ReactNode } = {
  flight: <Plane className="h-8 w-8 text-blue-500" />,
  train: <Train className="h-8 w-8 text-emerald-500" />,
  bus: <Bus className="h-8 w-8 text-amber-500" />,
  driving: <Briefcase className="h-8 w-8 text-gray-500" />,
};

function BookingOptionCard({ option }: { option: BookingOption }) {
    const getBookingUrl = () => {
        // This is a simplified example. Real-world implementation would be more complex.
        const encodedProvider = encodeURIComponent(option.provider);
        return `https://www.skyscanner.net/search?q=${encodedProvider}`;
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
                {transportIcons[option.type]}
                <div>
                    <CardTitle>{option.provider}</CardTitle>
                    <CardDescription>{option.details}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div className="text-sm">
                    <p><strong>Duration:</strong> {option.duration}</p>
                    <p><strong>Price:</strong> <span className="font-bold text-lg">{option.price}</span></p>
                    {option.ecoFriendly && <p className="text-green-600 font-semibold">Eco-Friendly</p>}
                </div>
                <Button asChild>
                    <Link href={getBookingUrl()} target="_blank">
                        Book Now
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}


export default function BookingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);

    const selectedTrip = trips?.find(trip => trip.id === selectedTripId);

    const isLoading = isUserLoading || isLoadingTrips;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }

        if (!user) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Login to View Bookings</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Please log in to select a trip and see your booking options.
                    </p>
                </Card>
            );
        }

        if (!trips || trips.length === 0) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Trips Found</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You haven't planned any trips yet. Go to the AI Trip Planner to start your next adventure!
                    </p>
                </Card>
            )
        }
        
        return (
            <>
                <Select onValueChange={setSelectedTripId} value={selectedTripId ?? ''}>
                    <SelectTrigger className="w-full md:w-1/2 lg:w-1/3">
                        <SelectValue placeholder="Select a trip to see booking options..." />
                    </SelectTrigger>
                    <SelectContent>
                        {trips.map(trip => (
                            <SelectItem key={trip.id} value={trip.id}>
                                {trip.tripTitle || `Trip to ${trip.destination}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedTrip && (
                    <div className="mt-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Transport Options</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {selectedTrip.bookingOptions?.map((opt, index) => (
                                    <BookingOptionCard key={index} option={opt} />
                                ))}
                                {!selectedTrip.bookingOptions?.length && <p>No transport bookings found for this trip.</p>}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Accommodation</h2>
                             <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Hotel className="h-8 w-8 text-rose-500" />
                                    <div>
                                        <CardTitle>Find Your Stay in {selectedTrip.destination}</CardTitle>
                                        <CardDescription>Explore hotels, rentals, and more.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <p className="text-muted-foreground">Ready to find the perfect place?</p>
                                    <Button asChild>
                                        <Link href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(selectedTrip.destination)}`} target="_blank">
                                            Search on Booking.com
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">My Bookings</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Select a planned trip to see all your booking options in one place.
                </p>
            </div>
            {renderContent()}
        </main>
    );
}

    