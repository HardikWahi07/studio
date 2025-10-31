'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Save, CheckCircle, Wand2, Map } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { planTrip } from '@/ai/flows/plan-trip';
import type { PlanTripOutput, PlanTripInput } from '@/ai/flows/plan-trip.types';
import { CityCombobox } from '@/components/city-combobox';
import { useSettings } from '@/context/settings-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthDialog } from '@/components/auth-dialog';
import { TripItinerary } from '@/components/trip-itinerary';
import { useTranslations } from '@/hooks/use-translations';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


const formSchema = z.object({
    origin: z.string().min(1, 'Origin is required.'),
    destination: z.string().min(1, 'Destination is required.'),
    departureDate: z.string().min(1, 'Departure date is required.'),
    tripDuration: z.coerce.number().min(1, 'Duration must be at least 1 day.').max(365, 'Duration cannot exceed 365 days.'),
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
    const t = useTranslations();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [results, setResults] = useState<PlanTripOutput | null>(null);
    const [tripSaved, setTripSaved] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const { currency } = useSettings();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // State for on-device AI
    const [simpleItinerary, setSimpleItinerary] = useState<string | null>(null);
    const [isSimpleLoading, setIsSimpleLoading] = useState(false);
    const [showAiError, setShowAiError] = useState(false);

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
        setSimpleItinerary(null);
        setTripSaved(false);

        if (!user && !isUserLoading) {
            toast({
              title: t('TripPlannerPage.toastLoginTitle'),
              description: t('TripPlannerPage.toastLoginDescription'),
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
            toast({ title: t('TripPlannerPage.toastErrorTitle'), description: t('TripPlannerPage.toastErrorDescription'), variant: 'destructive', });
        } finally {
            setIsLoading(false);
        }
    };
    
    async function handleGenerateShortItinerary() {
        const values = form.getValues();
        const { destination, tripDuration, interests } = values;

        if (!destination || !tripDuration || !interests) {
            toast({
                title: "Missing Information",
                description: "Please fill in Destination, Trip Duration, and Your Interests to generate a short itinerary.",
                variant: 'destructive'
            });
            return;
        }

        setShowAiError(false);
        setIsSimpleLoading(true);
        setSimpleItinerary(null);
        setResults(null);
        setTripSaved(false);

        try {
             const canCreate = await window.ai?.canCreateTextSession();
             if (canCreate !== 'readily') {
                setShowAiError(true);
                setIsSimpleLoading(false);
                return;
             }
             const session = await window.ai.createTextSession();
             const prompt = `You are an expert travel assistant. Generate a simple, day-by-day trip itinerary based on the following information. Your response must be plain text, formatted with markdown for readability. Do not suggest booking links or complex options.

                - **Destination:** ${destination}
                - **Duration:** ${tripDuration} days
                - **Interests & Preferences:** ${interests}

                Your Task:
                1. Create a simple title for the trip.
                2. For each day, provide 2-3 suggestions for activities or meals. Keep descriptions brief.`;

            const stream = session.promptStreaming(prompt);
            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSimpleItinerary(fullResponse);
            }
        } catch (error) {
            console.error("Failed to generate short itinerary:", error);
            setShowAiError(true);
        } finally {
            setIsSimpleLoading(false);
        }
    }


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
            
            const tripDataToSave = {
                id: tripRef.id,
                userId: user.uid,
                destination: values.destination,
                origin: values.origin,
                startDate: values.departureDate,
                travelers: values.travelers,
                itinerary: results.itinerary,
                journeyToHub: results.journeyToHub || [],
                bookingOptions: results.bookingOptions,
                hotelOptions: results.hotelOptions,
                localTransportOptions: results.localTransportOptions,
                tripTitle: results.tripTitle,
                createdAt: serverTimestamp(),
                // Only include form values relevant to the trip, not all of them
                tripPace: values.tripPace,
                travelStyle: values.travelStyle,
                accommodationType: values.accommodationType,
                accommodationBudget: values.accommodationBudget,
                interests: values.interests,
            };

            await setDoc(tripRef, tripDataToSave);
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
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('TripPlannerPage.title')}</h1>
                <p className="text-muted-foreground max-w-2xl">{t('TripPlannerPage.description')}</p>
            </div>
            
            {showAiError && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>On-Device AI Not Supported</AlertTitle>
                <AlertDescription>
                    This browser does not support the built-in AI required for this feature. Please try again with a browser that supports the Prompt API, like the latest version of Google Chrome.
                </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('TripPlannerPage.formTitle')}</CardTitle>
                    <CardDescription>{t('TripPlannerPage.formDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField control={form.control} name="origin" render={({ field }) => (
                                    <FormItem><FormLabel>{t('TripPlannerPage.fromLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('TripPlannerPage.fromPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="destination" render={({ field }) => (
                                    <FormItem><FormLabel>{t('TripPlannerPage.toLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('TripPlannerPage.toPlaceholder')} /><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="departureDate" render={({ field }) => (
                                        <FormItem><FormLabel>{t('TripPlannerPage.departureLabel')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="tripDuration" render={({ field }) => (
                                        <FormItem><FormLabel>{t('TripPlannerPage.durationLabel')}</FormLabel><FormControl><Input type="number" min="1" max="365" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="tripPace" render={({ field }) => (
                                    <FormItem><FormLabel>{t('TripPlannerPage.paceLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.pacePlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="relaxed">{t('TripPlannerPage.paceRelaxed')}</SelectItem>
                                            <SelectItem value="moderate">{t('TripPlannerPage.paceModerate')}</SelectItem>
                                            <SelectItem value="fast-paced">{t('TripPlannerPage.paceFast')}</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="travelStyle" render={({ field }) => (
                                        <FormItem><FormLabel>{t('TripPlannerPage.styleLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.stylePlaceholder')} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="solo">{t('TripPlannerPage.styleSolo')}</SelectItem>
                                                <SelectItem value="couple">{t('TripPlannerPage.styleCouple')}</SelectItem>
                                                <SelectItem value="family">{t('TripPlannerPage.styleFamily')}</SelectItem>
                                                <SelectItem value="group">{t('TripPlannerPage.styleGroup')}</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="travelers" render={({ field }) => (
                                        <FormItem><FormLabel>{t('TripPlannerPage.travelersLabel')}</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="accommodationType" render={({ field }) => (
                                        <FormItem><FormLabel>{t('TripPlannerPage.accommodationLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.accommodationPlaceholder')} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="hotel">{t('TripPlannerPage.accommodationHotel')}</SelectItem>
                                                <SelectItem value="hostel">{t('TripPlannerPage.accommodationHostel')}</SelectItem>
                                                <SelectItem value="vacation-rental">{t('TripPlannerPage.accommodationRental')}</SelectItem>
                                                <SelectItem value="none">{t('TripPlannerPage.accommodationNone')}</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    {accommodationType !== 'none' && (
                                      <FormField control={form.control} name="accommodationBudget" render={({ field }) => (
                                          <FormItem><FormLabel>{t('TripPlannerPage.accommodationBudgetLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.accommodationBudgetPlaceholder')} /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                  <SelectItem value="budget">{t('TripPlannerPage.accommodationBudgetBudget')}</SelectItem>
                                                  <SelectItem value="moderate">{t('TripPlannerPage.accommodationBudgetModerate')}</SelectItem>
                                                  <SelectItem value="luxury">{t('TripPlannerPage.accommodationBudgetLuxury')}</SelectItem>
                                              </SelectContent>
                                          </Select><FormMessage /></FormItem>
                                      )}/>
                                    )}
                                </div>
                                 <FormField control={form.control} name="planeClass" render={({ field }) => (
                                    <FormItem><FormLabel>{t('TripPlannerPage.planeClassLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.planeClassPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="economy">{t('TripPlannerPage.planeClassEconomy')}</SelectItem>
                                            <SelectItem value="premium-economy">{t('TripPlannerPage.planeClassPremiumEconomy')}</SelectItem>
                                            <SelectItem value="business">{t('TripPlannerPage.planeClassBusiness')}</SelectItem>
                                            <SelectItem value="first">{t('TripPlannerPage.planeClassFirst')}</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="trainClass" render={({ field }) => (
                                    <FormItem><FormLabel>{t('TripPlannerPage.trainClassLabel')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('TripPlannerPage.trainClassPlaceholder')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="sleeper">{t('TripPlannerPage.trainClassSleeper')}</SelectItem>
                                            <SelectItem value="ac-3-tier">{t('TripPlannerPage.trainClassAC3')}</SelectItem>
                                            <SelectItem value="ac-2-tier">{t('TripPlannerPage.trainClassAC2')}</SelectItem>
                                            <SelectItem value="ac-first-class">{t('TripPlannerPage.trainClassACFirst')}</SelectItem>
                                            <SelectItem value="chair-car">{t('TripPlannerPage.trainClassChairCar')}</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="interests" render={({ field }) => (
                                <FormItem><FormLabel>{t('TripPlannerPage.interestsLabel')}</FormLabel><FormControl><Textarea placeholder={t('TripPlannerPage.interestsPlaceholder')} rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button type="submit" disabled={isLoading || isSimpleLoading} className="w-full sm:w-auto">
                                    {isLoading ? <><Loader2 className="animate-spin" /> <span className="ml-2">{t('TripPlannerPage.searchingButton')}</span></> : <><Search /> <span className="ml-2">{t('TripPlannerPage.searchButton')}</span></>}
                                </Button>
                                <Button type="button" onClick={handleGenerateShortItinerary} disabled={isLoading || isSimpleLoading} variant="outline" className="w-full sm:w-auto">
                                    {isSimpleLoading ? <><Loader2 className="animate-spin" /> <span className="ml-2">Generating...</span></> : <><Wand2 /> <span className="ml-2">Generate Short Itinerary</span></>}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {(isLoading || isSimpleLoading) && (
                <div className="flex flex-col items-center justify-center pt-10 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-muted-foreground">{isLoading ? t('TripPlannerPage.loadingMessage') : 'Crafting your itinerary with on-device AI...'}</p>
                    <p className="text-sm text-muted-foreground">Crafting your perfect journey to {form.getValues('destination')}...</p>
                </div>
            )}
            
            {simpleItinerary && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Quick Itinerary</CardTitle>
                        <CardDescription>A simple, on-device AI generated plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {simpleItinerary}
                    </CardContent>
                </Card>
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
