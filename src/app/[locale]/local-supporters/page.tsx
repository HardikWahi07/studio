'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, MapPin, Users, Search, Check, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/auth-dialog';

type AvailabilitySlot = {
    day: string;
    time: string;
    booked: boolean;
};

type LocalSupporter = {
    id: string;
    name: string;
    bio: string;
    location: string;
    languages: string[];
    avatarUrl: string;
    response_time: string;
    availability: AvailabilitySlot[];
};

type GeoState = 'idle' | 'getting_location' | 'fetching_supporters' | 'error' | 'success';

export default function LocalSupportersPage() {
    const t = useTranslations('LocalSupportersPage');
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [searchLocation, setSearchLocation] = useState('');
    const [searchedCity, setSearchedCity] = useState('');
    const [geoState, setGeoState] = useState<GeoState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedSupporter, setSelectedSupporter] = useState<LocalSupporter | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [isProcessingBooking, setIsProcessingBooking] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);


    useEffect(() => {
        if ('geolocation' in navigator) {
            setGeoState('getting_location');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        const city = data.address.city || data.address.town || data.address.village;
                        if (city) {
                            setSearchedCity(city);
                            setSearchLocation(city);
                            setGeoState('fetching_supporters');
                        } else {
                            throw new Error("Could not determine city from your location.");
                        }
                    } catch (error) {
                        setErrorMessage('Could not find your city. Please search manually.');
                        setGeoState('error');
                    }
                },
                (error) => {
                    setErrorMessage('Location access was denied. Please enable it in your browser settings or search for a city manually.');
                    setGeoState('error');
                }
            );
        } else {
             setErrorMessage('Geolocation is not supported by your browser. Please search for a city manually.');
             setGeoState('error');
        }
    }, []);

    const supportersQuery = useMemoFirebase(() => {
        if (!firestore || !searchedCity) return null;
        return query(
            collection(firestore, 'supporters'), 
            where('location', '>=', searchedCity),
            where('location', '<=', searchedCity + '\uf8ff'),
            orderBy('location'),
            orderBy('name')
        );
    }, [firestore, searchedCity]);

    const { data: supporters, isLoading: isLoadingSupporters, forceRefetch } = useCollection<LocalSupporter>(supportersQuery);
    
    useEffect(() => {
        if (!isLoadingSupporters && searchedCity) {
            setGeoState('success');
        }
    }, [isLoadingSupporters, searchedCity]);

    const isLoading = geoState === 'getting_location' || geoState === 'fetching_supporters' || (searchedCity && isLoadingSupporters);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchedCity(searchLocation);
        setGeoState('fetching_supporters');
    }

    const openBookingModal = (supporter: LocalSupporter, slot: AvailabilitySlot) => {
        if (!user) {
            setIsAuthDialogOpen(true);
            return;
        }
        setSelectedSupporter(supporter);
        setSelectedSlot(slot);
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!firestore || !user || !selectedSupporter || !selectedSlot) return;

        setIsProcessingBooking(true);

        try {
            const batch = writeBatch(firestore);

            // 1. Create a new booking document
            const bookingRef = doc(collection(firestore, 'bookings'));
            batch.set(bookingRef, {
                id: bookingRef.id,
                userId: user.uid,
                userName: user.displayName,
                supporterId: selectedSupporter.id,
                supporterName: selectedSupporter.name,
                experience: "Welcome Walk & Chat",
                day: selectedSlot.day,
                time: selectedSlot.time,
                bookedAt: serverTimestamp(),
            });

            // 2. Update the supporter's availability
            const supporterRef = doc(firestore, 'supporters', selectedSupporter.id);
            const updatedAvailability = selectedSupporter.availability.map(slot => 
                (slot.day === selectedSlot.day && slot.time === selectedSlot.time)
                ? { ...slot, booked: true }
                : slot
            );
            batch.update(supporterRef, { availability: updatedAvailability });

            await batch.commit();

            toast({
                title: 'Booking Confirmed!',
                description: `Your meeting with ${selectedSupporter.name} is set.`,
            });
            
            // Force a refetch of the supporters data to show updated availability
            if (forceRefetch) forceRefetch();

        } catch (error) {
            console.error("Booking failed:", error);
            toast({
                title: 'Booking Failed',
                description: 'Could not complete the booking. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessingBooking(false);
            setIsBookingModalOpen(false);
        }
    };


    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }

        if (geoState === 'error' && !searchedCity) {
            return (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <MapPin className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">{t('locationErrorTitle')}</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       {errorMessage}
                    </p>
                </Card>
            );
        }

        if (searchedCity && !supporters?.length) {
            return (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">{t('noSupportersTitle', {city: searchedCity})}</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       {t('noSupportersDescription')}
                    </p>
                </Card>
            );
        }

        if (supporters && supporters.length > 0) {
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {supporters.map(supporter => (
                        <Card key={supporter.id} className="flex flex-col">
                            <CardHeader className="flex flex-col items-center text-center pt-6">
                                <Avatar className="h-24 w-24 border-4 border-primary/20">
                                    <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                                    <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="font-headline text-xl mt-4">{supporter.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {supporter.location}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-muted-foreground flex-grow">
                                <p>{supporter.bio}</p>
                                
                                <div className="flex flex-wrap gap-2 justify-center pt-4">
                                    {supporter.languages.map(lang => (
                                        <Badge key={lang} variant="secondary">{lang}</Badge>
                                    ))}
                                </div>
                                
                            </CardContent>
                            <CardFooter className="flex-col gap-4">
                                 <div className="w-full text-left">
                                     <h4 className="font-bold text-sm mb-2">Book an Experience</h4>
                                     <div className="flex flex-wrap gap-2">
                                         {supporter.availability?.map((slot, index) => (
                                            <Button 
                                                key={index}
                                                variant={slot.booked ? "secondary" : "outline"}
                                                size="sm"
                                                disabled={slot.booked}
                                                onClick={() => openBookingModal(supporter, slot)}
                                                className="text-xs"
                                            >
                                                {slot.day}, {slot.time}
                                            </Button>
                                         ))}
                                     </div>
                                 </div>
                                <Button className="w-full">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t('messageButton')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                <MapPin className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 font-bold text-lg">{t('findSupportersPromptTitle')}</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                   {t('findSupportersPromptDescription')}
                </p>
            </Card>
        );
    };

    return (
        <>
            <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Your Booking</DialogTitle>
                        <DialogDescription>
                            You are booking a "Welcome Walk & Chat" with <span className="font-bold">{selectedSupporter?.name}</span> for <span className="font-bold">{selectedSlot?.day} at {selectedSlot?.time}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsBookingModalOpen(false)} disabled={isProcessingBooking}>Cancel</Button>
                        <Button onClick={handleConfirmBooking} disabled={isProcessingBooking}>
                            {isProcessingBooking ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</>
                            ) : (
                                <><Check className="mr-2 h-4 w-4" /> Confirm Booking</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
                <div className="space-y-2">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        {t('description')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('findSupporterTitle')}</CardTitle>
                        <CardDescription>{t('findSupporterDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input 
                                placeholder={t('searchPlaceholder')}
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                {t('searchButton')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {renderContent()}
            </main>
        </>
    );
}
    