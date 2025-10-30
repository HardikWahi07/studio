
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Save, CheckCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { planTrip } from '@/ai/flows/plan-trip';
import type { PlanTripOutput, PlanTripInput } from '@/ai/flows/plan-trip.types';
import { CityCombobox } from '@/components/city-combobox';
import { useSettings } from '@/context/settings-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthDialog } from '@/components/auth-dialog';
import { TripItinerary } from '@/components/trip-itinerary';

const formSchema = z.object({
    origin: z.string().min(1, 'Origin is required.'),
    destination: z.string().min(1, 'Destination is required.'),
    departureDate: z.string().min(1, 'Departure date is required.'),
    tripDuration: z.coerce.number().min(1, 'Duration must be at least 1 day.'),
    travelers: z.coerce.number().min(1, "Please enter at least 1 traveler.").positive(),
    tripPace: z.enum(['relaxed', 'moderate', 'fast-paced']),
    travelStyle: z.enum(['solo', 'couple', 'family', 'group']),
    accommodationType: z.enum(['hotel', 'hostel', 'vacation-rental', 'none']),
    accommodationBudget: z.enum(['budget', 'moderate', 'luxury']).optional(),
    planeClass: z.enum(['economy', 'premium-economy', 'business', 'first']).optional(),
    trainClass: z.enum(['sleeper', 'ac-3-tier', 'ac-2-tier', 'ac-first-class', 'chair-car']).optional(),
    interests: z.string().min(10, 'Please tell us a bit more about your interests.'),
});

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
        defaultValues: { origin: '', destination: '', departureDate: '', tripDuration: 7, travelers: 1, tripPace: 'moderate', travelStyle: 'solo', accommodationType: 'hotel', accommodationBudget: 'moderate', interests: '' },
    });

    const accommodationType = useWatch({
      control: form.control,
      name: 'accommodationType'
    });

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        setTripSaved(false);

        if (!user && !isUserLoading) {
            toast({
              title: t('toastLoginTitle'),
              description: t('toastLoginDescription'),
            });
            setIsAuthDialogOpen(true);
            setIsLoading(false);
            return;
        }

        try {
            const planTripInput: PlanTripInput = {
                origin: values.origin,
                destination: values.destination,
                departureDate: values.departureDate,
                tripDuration: values.tripDuration,
                travelers: values.travelers,
                tripPace: values.tripPace,
                travelStyle: values.travelStyle,
                accommodationType: values.accommodationType,
                accommodationBudget: values.accommodationBudget,
                planeClass: values.planeClass,
                trainClass: values.trainClass,
                interests: values.interests,
                currency: currency,
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
        if (!user) {
            setIsAuthDialogOpen(true);
            return;
        }
        if (!results || !firestore) return;
        setIsSaving(true);

        try {
            const values = form.getValues();
            const tripRef = doc(collection(firestore, `users/${user.uid}/trips`));
            await setDoc(tripRef, {
                id: tripRef.id, userId: user.uid, destination: values.destination, origin: values.origin, startDate: values.departureDate, travelers: values.travelers, itinerary: results.itinerary, journeyToHub: results.journeyToHub || [], bookingOptions: results.bookingOptions, hotelOptions: results.hotelOptions, localTransportOptions: results.localTransportOptions, tripTitle: results.tripTitle, createdAt: serverTimestamp(), ...values
            });
            toast({ title: "Itinerary Saved!", description: `Your trip to ${values.destination} has been saved to 'My Trips'.`, });
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
                                <FormField control={form.control} name="origin" render={({ field }) => (
                                    <FormItem><FormLabel>{t('fromLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('fromPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="destination" render={({ field }) => (
                                    <FormItem><FormLabel>{t('toLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('toPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="departureDate" render={({ field }) => (
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
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="accommodationType" render={({ field }) => (
                                        <FormItem><FormLabel>{t('accommodationLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={t('accommodationPlaceholder')} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="hotel">{t('accommodationHotel')}</SelectItem>
                                                <SelectItem value="hostel">{t('accommodationHostel')}</SelectItem>
                                                <SelectItem value="vacation-rental">{t('accommodationRental')}</SelectItem>
                                                <SelectItem value="none">{t('accommodationNone')}</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    {accommodationType !== 'none' && (
                                      <FormField control={form.control} name="accommodationBudget" render={({ field }) => (
                                          <FormItem><FormLabel>{t('accommodationBudgetLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder={t('accommodationBudgetPlaceholder')} /></SelectTrigger></FormControl>
                                              <SelectContent><SelectItem value="budget">{t('accommodationBudgetBudget')}</SelectItem><SelectItem value="moderate">{t('accommodationBudgetModerate')}</SelectItem><SelectItem value="luxury">{t('accommodationBudgetLuxury')}</SelectItem></SelectContent>
                                          </Select><FormMessage /></FormItem>
                                      )}/>
                                    )}
                                </div>
                                 <FormField control={form.control} name="planeClass" render={({ field }) => (
                                    <FormItem><FormLabel>{t('planeClassLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('planeClassPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="economy">{t('planeClassEconomy')}</SelectItem><SelectItem value="premium-economy">{t('planeClassPremiumEconomy')}</SelectItem><SelectItem value="business">{t('planeClassBusiness')}</SelectItem><SelectItem value="first">{t('planeClassFirst')}</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="trainClass" render={({ field }) => (
                                    <FormItem><FormLabel>{t('trainClassLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('trainClassPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="sleeper">{t('trainClassSleeper')}</SelectItem>
                                            <SelectItem value="ac-3-tier">{t('trainClassAC3')}</SelectItem>
                                            <SelectItem value="ac-2-tier">{t('trainClassAC2')}</SelectItem>
                                            <SelectItem value="ac-first-class">{t('trainClassACFirst')}</SelectItem>
                                            <SelectItem value="chair-car">{t('trainClassChairCar')}</SelectItem>
                                        </SelectContent>
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
                    <p className="text-sm text-muted-foreground">Crafting your perfect journey to {form.getValues('destination')}...</p>
                </div>
            )}

            {results && !isLoading && (
                <div className="pt-6 space-y-6">
                    <div className="text-center">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold">{results.tripTitle}</h2>
                        {!tripSaved && (
                        <Button onClick={handleSaveTrip} disabled={isSaving || isUserLoading} className="mt-4">
                            {isSaving && <Loader2 className="animate-spin mr-2" />}
                            <Save className="mr-2" />
                            Save Trip
                        </Button>
                        )}
                        {tripSaved && (
                             <div className="mt-4 inline-flex items-center gap-2 text-green-600 font-semibold">
                                <CheckCircle /> Trip Saved!
                            </div>
                        )}
                    </div>
                   <TripItinerary results={results} />
                </div>
            )}
        </main>
    );
}
