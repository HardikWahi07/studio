
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Plane, Train, Bus, Leaf, Sparkles, Star, Loader2, Search, CheckCircle, 
    Bike, TramFront, Car, Walking, Footprints, Clock, MapPin, Ticket, Info, Save
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { planTrip } from '@/ai/flows/plan-trip';
import type { PlanTripOutput, PlanTripInput, BookingOption, TransportSegment } from '@/ai/flows/plan-trip.types';
import { CityCombobox } from '@/components/city-combobox';
import { useSettings } from '@/context/settings-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AuthDialog } from '@/components/auth-dialog';

const formSchema = z.object({
    from: z.string().min(1, 'Origin is required.'),
    to: z.string().min(1, 'Destination is required.'),
    departure: z.string().min(1, 'Departure date is required.'),
    tripDuration: z.coerce.number().min(1, 'Duration must be at least 1 day.').max(14, 'Duration cannot exceed 14 days.'),
    travelers: z.coerce.number().min(1, "Please enter at least 1 traveler.").positive(),
    tripPace: z.enum(['relaxed', 'moderate', 'fast-paced']),
    travelStyle: z.enum(['solo', 'couple', 'family', 'group']),
    accommodationType: z.enum(['hotel', 'hostel', 'vacation-rental']),
    interests: z.string().min(10, 'Please tell us a bit more about your interests.'),
});

const transportIcons: { [key: string]: React.ReactNode } = {
    Walk: <Footprints className="h-5 w-5 text-green-500" />,
    Metro: <TramFront className="h-5 w-5 text-blue-500" />,
    Bus: <Bus className="h-5 w-5 text-orange-500" />,
    Taxi: <Car className="h-5 w-5 text-yellow-500" />,
    'E-bike': <Bike className="h-5 w-5 text-green-500" />,
    Train: <Train className="h-5 w-5 text-purple-500" />,
    flight: <Plane className="h-5 w-5 text-sky-500" />,
    train: <Train className="h-5 w-5 text-purple-500" />,
    bus: <Bus className="h-5 w-5 text-orange-500" />,
    "Auto-rickshaw": <Car className="h-5 w-5 text-yellow-500" />,
};

function TransportSegmentDisplay({ segment }: { segment: TransportSegment }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1">
                {transportIcons[segment.mode] || <Car className="h-5 w-5" />}
            </div>
            <div>
                <p className="font-semibold text-sm">{segment.mode} <span className="text-muted-foreground font-normal">({segment.duration})</span></p>
                <p className="text-xs text-muted-foreground">{segment.description}</p>
                 {segment.ecoFriendly && <Leaf className="h-3 w-3 text-green-500 mt-1" title="Eco-friendly"/>}
            </div>
        </div>
    )
}

export default function TripPlannerPage() {
    const t = useTranslations('TripPlannerPage');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [results, setResults] = useState<PlanTripOutput | null>(null);
    const [tripSaved, setTripSaved] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const { currency } = useSettings();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { from: '', to: '', departure: '', tripDuration: 7, travelers: 1, tripPace: 'moderate', travelStyle: 'solo', accommodationType: 'hotel', interests: '', },
    });

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        setTripSaved(false);

        try {
            const planTripInput: PlanTripInput = {
                origin: values.from, destination: values.to, departureDate: values.departure, tripDuration: values.tripDuration, travelers: values.travelers, currency: currency, tripPace: values.tripPace, travelStyle: values.travelStyle, accommodationType: values.accommodationType, interests: values.interests,
            };
            const response = await planTrip(planTripInput);
            setResults(response);
        } catch (error) {
            console.error('Failed to plan trip:', error);
            toast({ title: t('toastErrorTitle'), description: t('toastErrorDescription'), variant: 'destructive', });
        } finally {
            setIsLoading(false);
        }
    };
    
    async function handleSaveTrip() {
        if (!user || !firestore) {
            setIsAuthDialogOpen(true);
            return;
        }
        if (!results) return;
        setIsSaving(true);

        try {
            const values = form.getValues();
            const tripRef = doc(collection(firestore, `users/${user.uid}/trips`));
            await setDoc(tripRef, {
                id: tripRef.id, userId: user.uid, destination: values.to, origin: values.from, startDate: values.departure, travelers: values.travelers, itinerary: results.itinerary, journeyToHub: results.journeyToHub || [], bookingOptions: results.bookingOptions, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            });
            toast({ title: "Itinerary Saved!", description: `Your trip to ${values.to} has been saved to 'My Trips'.`, });
            setTripSaved(true);
        } catch(error) {
             toast({ title: "Save Failed", description: "There was an error saving your trip. Please try again.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
            <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />

            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl">{t('description')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('formTitle')}</CardTitle>
                    <CardDescription>{t('formDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField control={form.control} name="from" render={({ field }) => (
                                    <FormItem><FormLabel>{t('fromLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('fromPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="to" render={({ field }) => (
                                    <FormItem><FormLabel>{t('toLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('toPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="departure" render={({ field }) => (
                                        <FormItem><FormLabel>{t('departureLabel')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="tripDuration" render={({ field }) => (
                                        <FormItem><FormLabel>{t('durationLabel')}</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="tripPace" render={({ field }) => (
                                    <FormItem><FormLabel>{t('paceLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('pacePlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="relaxed">{t('paceRelaxed')}</SelectItem><SelectItem value="moderate">{t('paceModerate')}</SelectItem><SelectItem value="fast-paced">{t('paceFast')}</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="travelStyle" render={({ field }) => (
                                        <FormItem><FormLabel>{t('styleLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={t('stylePlaceholder')} /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="solo">{t('styleSolo')}</SelectItem><SelectItem value="couple">{t('styleCouple')}</SelectItem><SelectItem value="family">{t('styleFamily')}</SelectItem><SelectItem value="group">{t('styleGroup')}</SelectItem></SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="travelers" render={({ field }) => (
                                        <FormItem><FormLabel>{t('travelersLabel')}</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="accommodationType" render={({ field }) => (
                                    <FormItem><FormLabel>{t('accommodationLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('accommodationPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="hotel">{t('accommodationHotel')}</SelectItem><SelectItem value="hostel">{t('accommodationHostel')}</SelectItem><SelectItem value="vacation-rental">{t('accommodationRental')}</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="interests" render={({ field }) => (
                                <FormItem><FormLabel>{t('interestsLabel')}</FormLabel><FormControl><Textarea placeholder={t('interestsPlaceholder')} rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? <><Loader2 className="animate-spin" /> <span className="ml-2">{t('searchingButton')}</span></> : <><Search /> <span className="ml-2">{t('searchButton')}</span></>}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex flex-col items-center justify-center pt-10 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-muted-foreground">{t('loadingMessage')}</p>
                    <p className="text-sm text-muted-foreground">Crafting your perfect journey to {form.getValues('to')}...</p>
                </div>
            )}

            {results && !isLoading && (
                <div className="pt-6 space-y-6">
                    <div className="text-center">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold">{results.tripTitle}</h2>
                        {!tripSaved && user && (
                        <Button onClick={handleSaveTrip} disabled={isSaving || isUserLoading} className="mt-4">
                            {isSaving && <Loader2 className="animate-spin mr-2" />}
                            <Save className="mr-2" />
                            Save Trip to My Plans
                        </Button>
                        )}
                        {tripSaved && (
                             <div className="mt-4 inline-flex items-center gap-2 text-green-600 font-semibold">
                                <CheckCircle /> Trip Saved!
                            </div>
                        )}
                         {!user && !isUserLoading && (
                            <Button onClick={() => setIsAuthDialogOpen(true)} className="mt-4">
                                <Save className="mr-2" />
                                Login to Save and Book
                            </Button>
                        )}
                    </div>

                    {results.journeyToHub && results.journeyToHub.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Journey to the Airport</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {results.journeyToHub.map((segment, idx) => (
                                    <TransportSegmentDisplay key={idx} segment={segment} />
                                ))}
                            </CardContent>
                        </Card>
                    )}
                    
                    {results.bookingOptions?.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Booking Options</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {results.bookingOptions.map((opt, idx) => (
                                    <Card key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                                        <div className="flex items-center gap-4">
                                            {transportIcons[opt.type]}
                                            <div>
                                                <p className="font-bold">{opt.provider} <span className="font-normal text-muted-foreground text-sm">{opt.details}</span></p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{opt.duration}</span>
                                                    {opt.ecoFriendly && <span className="flex items-center gap-1 text-green-600"><Leaf className="w-3 h-3"/>Eco-Friendly</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <p className="font-bold text-lg">{opt.price}</p>
                                            <Button asChild className="w-full sm:w-auto">
                                                <Link href={opt.bookingLink} target="_blank">Book Now</Link>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {results.itinerary.map((day, dayIndex) => (
                        <AccordionItem value={`item-${dayIndex}`} key={dayIndex}>
                            <AccordionTrigger className="text-lg font-bold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-sans">{day.day}</span>
                                    {day.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="border-l-2 border-primary/20 ml-4 pl-8 pt-4 space-y-6">
                               <p className="text-muted-foreground italic">{day.summary}</p>
                                {day.activities.map((activity, activityIndex) => (
                                    <div key={activityIndex} className="relative">
                                         <div className="absolute -left-[43px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                        <p className="font-bold text-base">{activity.time} - {activity.description}</p>
                                        <div className="text-sm text-muted-foreground space-y-2 mt-1">
                                           <p className='flex items-start gap-2'><MapPin className='mt-0.5' /> {activity.location}</p>
                                           <p className='flex items-start gap-2'><Info className='mt-0.5' /> {activity.details}</p>
                                        </div>
                                        {activity.transportToNext && (
                                            <div className="mt-4 p-3 rounded-md bg-secondary">
                                                <TransportSegmentDisplay segment={activity.transportToNext} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
        </main>
    );
}
