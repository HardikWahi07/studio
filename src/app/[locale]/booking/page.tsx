
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, CheckCircle, Users, Plane, Train, Bus, Hotel, Wallet, Leaf, Clock, Star, CarFront } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlanTripOutput, BookingOption, HotelOption } from '@/ai/flows/plan-trip.types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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

type Trip = PlanTripOutput & {
    id: string;
    destination: string;
    tripTitle: string;
    status?: 'Booked' | 'Pending';
    createdAt: any;
};

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="h-6 w-6 text-sky-500" />,
    train: <Train className="h-6 w-6 text-purple-500" />,
    bus: <Bus className="h-6 w-6 text-orange-500" />,
    driving: <CarFront className="h-6 w-6 text-gray-500" />,
};

function BookingOptionCard({ opt }: { opt: BookingOption }) {
    const { toast } = useToast();
    
    const handleBook = () => {
        toast({
            title: "Opening Booking Site",
            description: `Redirecting to ${opt.provider} to complete your booking.`,
        });
    }

    return (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
                {transportIcons[opt.type]}
                <div>
                    <p className="font-bold">{opt.provider} <span className="font-normal text-muted-foreground text-sm">{opt.details}</span></p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{opt.duration}</span>
                        {opt.ecoFriendly && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/50"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>}
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


export default function BookingPage() {
    const t = useTranslations('BookingPage');
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    // --- Data Fetching ---

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);
    const { data: trips, isLoading: isLoadingTrips, forceRefetch: forceRefetchTrips } = useCollection<Trip>(tripsQuery);
    
    // Fetch all bookings. The security rules allow this for any signed-in user.
    const allBookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'bookings'), orderBy('bookedAt', 'desc'));
    }, [user, firestore]);
    const { data: allBookings, isLoading: isLoadingBookings } = useCollection<LocalBooking>(allBookingsQuery);

    // Filter the bookings on the client-side. This is secure and efficient for the demo.
    const userBookings = useMemo(() => {
        if (!user || !allBookings) return [];
        return allBookings.filter(booking => booking.userId === user.uid);
    }, [user, allBookings]);


    // --- Derived State ---

    const selectedTrip = useMemo(() => {
        if (!trips || !selectedTripId) return null;
        const trip = trips.find(trip => trip.id === selectedTripId) || trips[0];
        if (trip && !selectedTripId) {
            setSelectedTripId(trip.id);
        }
        return trip;
    }, [trips, selectedTripId]);
    
    useEffect(() => {
        if(trips && trips.length > 0 && !selectedTripId) {
            setSelectedTripId(trips[0].id);
        }
    }, [trips, selectedTripId]);


    const sortedBookingOptions = useMemo(() => {
        if (!selectedTrip?.bookingOptions) return { best: null, cheapest: null, eco: null };

        const flights = selectedTrip.bookingOptions.filter(o => o.type === 'flight');
        const trains = selectedTrip.bookingOptions.filter(o => o.type === 'train');
        
        const eco = trains.length > 0 ? trains[0] : selectedTrip.bookingOptions.find(o => o.ecoFriendly);
        
        const parsePrice = (price: string) => parseFloat(price.replace(/[^0-9.]/g, ''));
        const cheapest = [...selectedTrip.bookingOptions].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))[0];

        const best = flights.length > 0 ? flights[0] : cheapest;

        return { best, cheapest, eco };
    }, [selectedTrip?.bookingOptions]);
    
    // --- Event Handlers ---
    
    const handleConfirmBooking = async () => {
        if (!firestore || !user || !selectedTripId) return;
        const tripDocRef = doc(firestore, 'users', user.uid, 'trips', selectedTripId);
        try {
            await updateDoc(tripDocRef, { status: 'Booked' });
            toast({
                title: "Trip Booked!",
                description: "Your trip status has been updated.",
            });
            if(forceRefetchTrips) forceRefetchTrips();
        } catch(e) {
            toast({
                title: "Update Failed",
                description: "Could not update trip status. Please try again.",
                variant: 'destructive',
            });
        }
    }
    
    // --- Render Logic ---
    const isLoading = isUserLoading || isLoadingTrips;
    const isTripBooked = selectedTrip?.status === 'Booked';

    if (isLoading) {
        return <main className="flex-1 p-4 md:p-8 space-y-8 bg-background"><Skeleton className="h-96 w-full" /></main>
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

    const renderTripBookingContent = () => {
        if (!trips?.length) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                    <Plane className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Trips to Book</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Once you generate a trip with our AI Planner, you can select it here to book flights and hotels.
                    </p>
                    <Button asChild className="mt-4"><Link href="/trip-planner">Plan a Trip</Link></Button>
                </Card>
            )
        }
        if (!selectedTrip) {
             return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                    <Wallet className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Select a Trip</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Choose one of your planned trips from the dropdown above to see booking options.
                    </p>
                </Card>
            )
        }
        return (
            <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h2 className="font-headline text-2xl font-bold">Booking for: <span className="text-primary">{selectedTrip.tripTitle}</span></h2>
                    {isTripBooked ? (
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
                
                 {selectedTrip.bookingOptions && selectedTrip.bookingOptions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Plane /> Transport to {selectedTrip.destination}</CardTitle>
                            <CardDescription>Our AI has found these options for your main travel leg.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sortedBookingOptions.best && (
                                 <div>
                                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wider uppercase">Best Option</h3>
                                    <BookingOptionCard opt={sortedBookingOptions.best} />
                                 </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                                {sortedBookingOptions.eco && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wider uppercase">Eco-Friendly</h3>
                                        <BookingOptionCard opt={sortedBookingOptions.eco} />
                                    </div>
                                )}
                                {sortedBookingOptions.cheapest && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wider uppercase">Cheapest</h3>
                                        <BookingOptionCard opt={sortedBookingOptions.cheapest} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {selectedTrip.hotelOptions && selectedTrip.hotelOptions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Hotel /> Hotel Options</CardTitle>
                            <CardDescription>Recommended places to stay based on your preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {selectedTrip.hotelOptions.map((opt, idx) => (
                               <HotelOptionCard key={idx} opt={opt} />
                           ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderLocalBookings = () => {
        if (isLoadingBookings) {
            return (
                <div className='space-y-4'>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }

        if (!userBookings.length) {
            return (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">No Local Bookings Yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Connect with a local supporter to book an experience. Your confirmed bookings will appear here.
                    </p>
                    <Button asChild className="mt-4"><Link href="/local-supporters">Find Supporters</Link></Button>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Booked Local Experiences</CardTitle>
                    <CardDescription>Here are the experiences you've confirmed with local supporters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
        );
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">
                     {t('title')}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    {t('description')}
                </p>
            </div>
            
            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Book Your Trip</CardTitle>
                        <CardDescription>Select one of your AI-planned trips to view flight, hotel, and other booking options.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-md">
                            {isLoadingTrips ? <Skeleton className="h-10 w-full" /> : (
                                <Select onValueChange={setSelectedTripId} value={selectedTripId || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a planned trip..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trips?.map(trip => (
                                            <SelectItem key={trip.id} value={trip.id}>
                                                {trip.tripTitle}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {renderTripBookingContent()}
                
                <div className="pt-8">
                     {renderLocalBookings()}
                </div>
            </div>
        </main>
    );
}
