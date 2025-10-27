'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Train, Bus, Leaf, Sparkles, Star, Loader2, Search, CheckCircle } from "lucide-react";
import { PexelsImage } from "@/components/pexels-image";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { planTrip } from '@/ai/flows/plan-trip';
import type { PlanTripOutput, Hotel } from '@/ai/flows/plan-trip.types';
import { CityCombobox } from '@/components/city-combobox';
import { useSettings } from '@/context/settings-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
    from: z.string().min(1, 'Origin is required.'),
    to: z.string().min(1, 'Destination is required.'),
    departure: z.string().min(1, 'Departure date is required.'),
    travelers: z.coerce.number().min(1, "Please enter at least 1 traveler.").positive(),
});

const transportIcons: { [key: string]: React.ReactNode } = {
    Flight: <Plane className="h-6 w-6 text-primary" />,
    Train: <Train className="h-6 w-6 text-primary" />,
    Bus: <Bus className="h-6 w-6 text-primary" />,
};

const CarbonFootprint = ({ value }: { value: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
            <Leaf
                key={i}
                className={`h-4 w-4 ${i < value ? 'text-green-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
            />
        ))}
    </div>
);

export default function TripPlannerPage() {
    const t = useTranslations('TripPlannerPage');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<PlanTripOutput | null>(null);
    const [tripId, setTripId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ transport: string | null, hotel: string | null }>({ transport: null, hotel: null });
    const { toast } = useToast();
    const { currency } = useSettings();
    const { user } = useUser();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            from: '',
            to: '',
            departure: new Date().toISOString().split('T')[0],
            travelers: 1,
        },
    });

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        setTripId(null);
        setSelectedItems({ transport: null, hotel: null });
        if (!user || !firestore) {
            toast({ title: t('toastLoginTitle'), description: t('toastLoginDescription'), variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            const newTripId = doc(doc(firestore, 'users', user.uid), 'trips', 'temp').id;
            setTripId(newTripId);

            const response = await planTrip({
                origin: values.from,
                destination: values.to,
                departureDate: values.departure,
                travelers: values.travelers,
                currency: currency,
            });

            const tripData = {
                id: newTripId,
                userId: user.uid,
                destination: values.to,
                origin: values.from,
                startDate: values.departure,
                endDate: values.departure, // Placeholder
                travelers: values.travelers,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                transport: null,
                hotel: null,
            };
            const tripRef = doc(firestore, 'users', user.uid, 'trips', newTripId);
            await setDoc(tripRef, tripData);

            setResults(response);
        } catch (error) {
            console.error('Failed to plan trip:', error);
            toast({
                title: t('toastErrorTitle'),
                description: t('toastErrorDescription'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    async function handleSelectItem(itemType: 'transport' | 'hotel', item: any) {
        if (!user || !firestore || !tripId) return;

        const tripRef = doc(firestore, 'users', user.uid, 'trips', tripId);
        const key = itemType === 'transport' ? 'transport' : 'hotel';
        
        try {
            await setDoc(tripRef, { [key]: item, updatedAt: serverTimestamp() }, { merge: true });
            setSelectedItems(prev => ({ ...prev, [itemType]: item.mode || item.name }));
            toast({
                title: t('toastItemSelected', { itemType: itemType.charAt(0).toUpperCase() + itemType.slice(1) }),
                description: t('toastItemSaved', { itemName: item.mode || item.name }),
            });
        } catch (error) {
            console.error(`Failed to save ${itemType}:`, error);
            toast({
                title: t('toastSaveError'),
                description: t('toastSaveErrorDescription', { itemType }),
                variant: "destructive",
            });
        }
    }


    const recommendedStays = results ? [
        results.recommendedStayLuxury,
        results.recommendedStayBudget,
        results.recommendedStayValue
    ].filter((stay): stay is Hotel => !!stay) : [];

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl">
                    {t('description')}
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name="from"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Label>{t('fromLabel')}</Label>
                                            <CityCombobox
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={t('fromPlaceholder')}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="to"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Label>{t('toLabel')}</Label>
                                            <CityCombobox
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={t('toPlaceholder')}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="departure"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>{t('departureLabel')}</Label>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="travelers"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>{t('travelersLabel')}</Label>
                                                 <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading || !user} className="w-full lg:w-auto">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                                    <span className="ml-2">{isLoading ? t('searchingButton') : t('searchButton')}</span>
                                </Button>
                            </div>
                             {!user && <p className="text-sm text-destructive mt-2">{t('loginToPlan')}</p>}
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center pt-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">{t('loadingMessage')}</p>
                </div>
            )}

            {results && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="font-headline text-2xl font-bold">{t('transportOptionsTitle')}</h2>
                        
                        {results.ecoMix && (
                            <Card className="bg-primary/10 border-primary">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Sparkles className="h-6 w-6" />
                                        {results.ecoMix.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <p className="md:col-span-3 text-muted-foreground text-left">
                                        {results.ecoMix.description}
                                    </p>
                                    <div className="font-semibold">{results.ecoMix.duration}</div>
                                    <div className="font-semibold">{results.ecoMix.cost}</div>
                                    <div className="flex justify-center"><CarbonFootprint value={results.ecoMix.carbonValue} /></div>
                                </CardContent>
                            </Card>
                        )}

                        {results.transportOptions.map((option, index) => (
                            <Card key={`${option.mode}-${index}`}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {transportIcons[option.mode] || <Plane className="h-6 w-6 text-primary" />}
                                        <div>
                                            <h3 className="font-bold">{option.mode}</h3>
                                            {option.recommendation && <p className="text-sm text-muted-foreground max-w-xs">{option.recommendation}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-center">
                                        <div>
                                            <p className="font-bold">{option.duration}</p>
                                            <p className="text-muted-foreground">Duration</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">{option.cost}</p>
                                            <p className="text-muted-foreground">Cost</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <CarbonFootprint value={option.carbonValue} />
                                            <p className="text-muted-foreground">Carbon</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => handleSelectItem('transport', option)} disabled={selectedItems.transport === option.mode}>
                                        {selectedItems.transport === option.mode ? <CheckCircle className="text-green-500" /> : t('selectButton')}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="font-headline text-2xl font-bold">{t('recommendedStaysTitle')}</h2>
                        {recommendedStays.map((stay, index) => (
                            <Card key={index}>
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                    <PexelsImage query={`${stay.name}, ${stay.location}`} alt={stay.name} className="w-full h-full object-cover" width={400} height={225} />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold">{stay.name}</h3>
                                    <p className='text-xs font-semibold uppercase text-primary'>{stay.recommendationType}</p>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                                        <span>{stay.rating} ({stay.reviews} {t('reviews')})</span>
                                    </div>
                                    <p className="text-lg font-semibold mt-2">{stay.pricePerNight} {t('pricePerNight')}</p>
                                    <Button className="w-full mt-4" onClick={() => handleSelectItem('hotel', stay)} disabled={selectedItems.hotel === stay.name}>
                                        {selectedItems.hotel === stay.name ? <><CheckCircle className="mr-2"/> {t('selectedButton')}</> : t('selectHotelButton')}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
