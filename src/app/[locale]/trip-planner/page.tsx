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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthDialog } from '@/components/auth-dialog';
import { TripItinerary } from '@/components/trip-itinerary';

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
              title: 'Please log in',
              description: 'You need to be logged in to plan a trip.',
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
            toast({ title: 'Error', description: 'Failed to generate trip plan. Please try again.', variant: 'destructive', });
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
                <h1 className="font-headline text-3xl md:text-4xl font-bold">AI Trip Planner</h1>
                <p className="text-muted-foreground max-w-2xl">Tell us about your dream trip, and our AI will craft a detailed, day-by-day itinerary just for you.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Plan Your Next Adventure</CardTitle>
                    <CardDescription>The more details you provide, the better your personalized plan will be.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField control={form.control} name="origin" render={({ field }) => (
                                    <FormItem><FormLabel>From</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder="Enter your origin city..." /><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="destination" render={({ field }) => (
                                    <FormItem><FormLabel>To</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder="Enter your destination city..." /><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="departureDate" render={({ field }) => (
                                        <FormItem><FormLabel>Departure Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="tripDuration" render={({ field }) => (
                                        <FormItem><FormLabel>Trip Duration (days)</FormLabel><FormControl><Input type="number" min="1" max="365" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="tripPace" render={({ field }) => (
                                    <FormItem><FormLabel>Trip Pace</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a pace..." /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="relaxed">Relaxed</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="fast-paced">Fast-paced</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="travelStyle" render={({ field }) => (
                                        <FormItem><FormLabel>Travel Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a style..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="solo">Solo</SelectItem><SelectItem value="couple">Couple</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="group">Group</SelectItem></SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="travelers" render={({ field }) => (
                                        <FormItem><FormLabel>Travelers</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="accommodationType" render={({ field }) => (
                                        <FormItem><FormLabel>Accommodation</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="hotel">Hotel</SelectItem>
                                                <SelectItem value="hostel">Hostel</SelectItem>
                                                <SelectItem value="vacation-rental">Vacation Rental</SelectItem>
                                                <SelectItem value="none">No Accommodation</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )}/>
                                    {accommodationType !== 'none' && (
                                      <FormField control={form.control} name="accommodationBudget" render={({ field }) => (
                                          <FormItem><FormLabel>Stay Budget</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Select budget..." /></SelectTrigger></FormControl>
                                              <SelectContent><SelectItem value="budget">Budget</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="luxury">Luxury</SelectItem></SelectContent>
                                          </Select><FormMessage /></FormItem>
                                      )}/>
                                    )}
                                </div>
                                 <FormField control={form.control} name="planeClass" render={({ field }) => (
                                    <FormItem><FormLabel>Plane Class</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select plane class..." /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="economy">Economy</SelectItem><SelectItem value="premium-economy">Premium Economy</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="first">First</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="trainClass" render={({ field }) => (
                                    <FormItem><FormLabel>Train Class</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select train class..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="sleeper">Sleeper</SelectItem>
                                            <SelectItem value="ac-3-tier">AC 3-Tier</SelectItem>
                                            <SelectItem value="ac-2-tier">AC 2-Tier</SelectItem>
                                            <SelectItem value="ac-first-class">AC First Class</SelectItem>
                                            <SelectItem value="chair-car">AC Chair Car</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="interests" render={({ field }) => (
                                <FormItem><FormLabel>Your Interests</FormLabel><FormControl><Textarea placeholder="e.g., Art museums, street food, hiking, local markets..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? <><Loader2 className="animate-spin" /> <span className="ml-2">Generating...</span></> : <><Search /> <span className="ml-2">Generate My Trip</span></>}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex flex-col items-center justify-center pt-10 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-muted-foreground">Finding the best options for you...</p>
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
