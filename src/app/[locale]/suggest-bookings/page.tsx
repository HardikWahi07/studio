
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Train, Bus, Clock, Leaf, Search, Sparkles, BadgeEuro, CarFront, Hotel, Star, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';
import { suggestTransportOptions } from "@/ai/flows/suggest-transport-options";
import type { SuggestTransportOptionsOutput, BookingOption, HotelOption, LocalTransportOption } from "@/ai/flows/suggest-transport-options.types";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/settings-context";
import { planTrip } from "@/ai/flows/plan-trip";

type Trip = PlanTripOutput & {
    id: string;
    destination: string;
    origin: string;
    tripTitle: string;
    startDate: string;
    travelers: number;
    status?: 'Booked' | 'Pending';
    createdAt: any;
    accommodationType: 'hotel' | 'hostel' | 'vacation-rental';
    accommodationBudget: 'budget' | 'moderate' | 'luxury';
    interests: string;
    tripPace: 'relaxed' | 'moderate' | 'fast-paced';
    travelStyle: 'solo' | 'couple' | 'family' | 'group';
    tripDuration: number;
};

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="h-6 w-6 text-sky-500" />,
    train: <Train className="h-6 w-6 text-purple-500" />,
    bus: <Bus className="h-6 w-6 text-orange-500" />,
    driving: <CarFront className="h-6 w-6 text-gray-500" />,
};

const localTransportIcons: { [key: string]: React.ReactNode } = {
    metro: <Train className="h-5 w-5 text-blue-500" />,
    bus: <Bus className="h-5 w-5 text-orange-500" />,
    taxi: <CarFront className="h-5 w-5 text-yellow-500" />,
    rideshare: <CarFront className="h-5 w-5 text-purple-500" />,
    bike: <Bike className="h-5 w-5 text-green-500" />,
    scooter: <Bike className="h-5 w-5 text-teal-500" />,
}

const recommendationBadges: { [key: string]: React.ReactNode } = {
    'Best': <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200"><Sparkles className="w-3 h-3 mr-1"/>Best Option</Badge>,
    'Cheapest': <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><BadgeEuro className="w-3 h-3 mr-1"/>Cheapest</Badge>,
    'Eco-Friendly': <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>,
}

function BookingOptionCard({ opt, recommendation }: { opt: BookingOption, recommendation?: 'Best' | 'Cheapest' | 'Eco-Friendly' }) {
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

function LocalTransportCard({ opt }: { opt: LocalTransportOption }) {
    return (
        <Card className="p-4">
            <div className="flex items-center gap-3">
                {localTransportIcons[opt.type] || <CarFront className="h-5 w-5" />}
                <div>
                    <p className="font-bold">{opt.provider}</p>
                    <p className="text-sm text-muted-foreground">{opt.details}</p>
                </div>
                <p className="text-sm font-semibold ml-auto">{opt.averageCost}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{opt.tip}</p>
        </Card>
    );
}

export default function SuggestBookingsPage() {
    const t = useTranslations('SuggestBookingsPage');
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { currency } = useSettings();
    const { toast } = useToast();

    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<PlanTripOutput | null>(null);

    const tripsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'trips'),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const { data: trips, isLoading: isLoadingTrips } = useCollection<Trip>(tripsQuery);
    const isLoading = isUserLoading || isLoadingTrips;

    const selectedTrip = useMemo(() => {
        if (!trips || !selectedTripId) return null;
        return trips.find(trip => trip.id === selectedTripId);
    }, [trips, selectedTripId]);
    
    async function handleSearch() {
        if (!selectedTrip) return;
        setIsLoadingSuggestions(true);
        setSuggestions(null);
        try {
            // Re-running the planTrip flow is better as it can generate hotels and local transport
            // based on the full context of the trip, which suggestTransportOptions cannot do.
            const result = await planTrip({
                origin: selectedTrip.origin,
                destination: selectedTrip.destination,
                currency: currency,
                accommodationType: selectedTrip.accommodationType,
                accommodationBudget: selectedTrip.accommodationBudget,
                interests: selectedTrip.interests,
                travelers: selectedTrip.travelers,
                tripPace: selectedTrip.tripPace,
                travelStyle: selectedTrip.travelStyle,
                departureDate: selectedTrip.startDate,
                tripDuration: selectedTrip.tripDuration
            });
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to suggest bookings:", error);
            toast({
                title: "Error",
                description: "Could not fetch booking suggestions. Please try again.",
                variant: 'destructive'
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    }

    if (isLoading) {
      return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-6 w-2/3 mb-8" />
            <Skeleton className="h-32 w-full" />
        </main>
      )
    }

    if (!user) {
        return (
            <main className="flex-1 p-4 md:p-8">
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[400px]">
                    <h3 className="font-bold text-lg">Please Log In</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You need to be logged in to get booking suggestions for your saved trips.
                    </p>
                </Card>
            </main>
        )
    }
    
    if (trips && trips.length === 0) {
        return (
            <main className="flex-1 p-4 md:p-8">
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[400px]">
                    <h3 className="font-bold text-lg">No Trips Found</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You don't have any saved trips yet. Plan a trip first!
                    </p>
                    <Button asChild className="mt-4"><Link href="/trip-planner">Plan a Trip</Link></Button>
                </Card>
            </main>
        )
    }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Select a Saved Trip</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                    <Select onValueChange={setSelectedTripId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose one of your saved trips..." />
                        </SelectTrigger>
                        <SelectContent>
                            {trips?.map(trip => (
                                <SelectItem key={trip.id} value={trip.id}>
                                    {trip.tripTitle || `Trip to ${trip.destination}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSearch} className="md:col-span-1 w-full" disabled={isLoadingSuggestions || !selectedTripId}>
                    <Search className="mr-2"/>
                    {isLoadingSuggestions ? "Searching..." : t('findButton')}
                </Button>
            </div>
        </CardContent>
      </Card>
      
        {(isLoadingSuggestions || suggestions) && (
        <div className="space-y-8 pt-4">
            {isLoadingSuggestions && (
                <>
                 <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-32 w-full" />
                </>
            )}
            
            {suggestions?.bookingOptions && suggestions.bookingOptions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Plane /> Transport to {selectedTrip?.destination}</CardTitle>
                        <CardDescription>Our AI has found these options for your main travel leg.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {suggestions.bookingOptions.filter(o=>o.price).sort((a,b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''))).slice(0,1).map((opt, idx) => <BookingOptionCard key={idx} opt={opt} recommendation="Cheapest" />)}
                        {suggestions.bookingOptions.filter(o=>o.price).sort((a,b) => parseFloat(a.duration.replace(/[^0-9.]/g, '')) - parseFloat(b.duration.replace(/[^0-9.]/g, ''))).slice(0,1).map((opt, idx) => <BookingOptionCard key={idx} opt={opt} recommendation="Best" />)}
                        {suggestions.bookingOptions.filter(o=>o.ecoFriendly).slice(0,1).map((opt, idx) => <BookingOptionCard key={idx} opt={opt} recommendation="Eco-Friendly" />)}
                    </CardContent>
                </Card>
            )}

            {suggestions?.hotelOptions && suggestions.hotelOptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Hotel /> Hotel & Stay Options</CardTitle>
                        <CardDescription>Recommended places to stay based on your preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {suggestions.hotelOptions.map((opt, idx) => (
                           <HotelOptionCard key={idx} opt={opt} />
                       ))}
                    </CardContent>
                </Card>
            )}

            {suggestions?.localTransportOptions && suggestions.localTransportOptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CarFront /> Local Transport</CardTitle>
                        <CardDescription>Best ways to get around in {selectedTrip?.destination}.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {suggestions.localTransportOptions.map((opt, idx) => (
                           <LocalTransportCard key={idx} opt={opt} />
                       ))}
                    </CardContent>
                </Card>
            )}
        </div>
        )}
    </main>
  );
}
