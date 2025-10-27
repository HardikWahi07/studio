
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Train, Bus, Leaf, Sparkles, Star, Loader2, Search } from "lucide-react";
import { PexelsImage } from "@/components/pexels-image";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { planTrip } from '@/ai/flows/plan-trip';
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';
import { CityCombobox } from '@/components/city-combobox';

const formSchema = z.object({
    from: z.string().min(1, 'Origin is required.'),
    to: z.string().min(1, 'Destination is required.'),
    departure: z.string().min(1, 'Departure date is required.'),
    travelers: z.string(),
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
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<PlanTripOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            from: '',
            to: '',
            departure: new Date().toISOString().split('T')[0],
            travelers: '1-economy',
        },
    });

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        try {
            const [numTravelers, travelClass] = values.travelers.split('-');
            const response = await planTrip({
                origin: values.from,
                destination: values.to,
                departureDate: values.departure,
                travelers: parseInt(numTravelers, 10),
                travelClass: travelClass,
            });
            setResults(response);
        } catch (error) {
            console.error('Failed to plan trip:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate trip plan. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">AI Trip Planner</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Find the best combination of transport and accommodation for your next adventure.
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
                                            <Label>From</Label>
                                            <CityCombobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select origin..."
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
                                            <Label>To</Label>
                                            <CityCombobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select destination..."
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
                                                <Label>Departure</Label>
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
                                                <Label>Travelers & Class</Label>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1-economy">1 Traveler, Economy</SelectItem>
                                                        <SelectItem value="2-economy">2 Travelers, Economy</SelectItem>
                                                        <SelectItem value="1-business">1 Traveler, Business</SelectItem>
                                                        <SelectItem value="2-business">2 Travelers, Business</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full lg:w-auto">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                                    <span className="ml-2">{isLoading ? 'Searching...' : 'Search'}</span>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center pt-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Finding the best options for you...</p>
                </div>
            )}

            {results && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="font-headline text-2xl font-bold">Transport Options</h2>
                        
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

                        {results.transportOptions.map(option => (
                            <Card key={option.mode}>
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
                                    <Button variant="outline">Select</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="font-headline text-2xl font-bold">Recommended Stay</h2>
                        {results.recommendedStay && (
                            <Card>
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                    <PexelsImage query={`luxury hotel ${results.recommendedStay.location}`} alt={results.recommendedStay.name} className="w-full h-full object-cover" width={400} height={225} />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold">{results.recommendedStay.name}</h3>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                                        <span>{results.recommendedStay.rating} ({results.recommendedStay.reviews} reviews)</span>
                                    </div>
                                    <p className="text-lg font-semibold mt-2">{results.recommendedStay.pricePerNight} / night</p>
                                    <Button className="w-full mt-4">View Hotel</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
