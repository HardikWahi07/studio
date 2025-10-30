
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CityCombobox } from '@/components/city-combobox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Plane, Train, Bus, Leaf, CarFront } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { suggestTransportBookings, SuggestTransportBookingsOutput } from '@/ai/flows/suggest-transport-bookings';
import { useSettings } from '@/context/settings-context';
import type { BookingOption } from '@/ai/flows/plan-trip.types';
import Link from 'next/link';

const formSchema = z.object({
    origin: z.string().min(1, 'Origin is required.'),
    destination: z.string().min(1, 'Destination is required.'),
    departureDate: z.string().min(1, 'Departure date is required.'),
});

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
                    <p className="font-bold">{opt.provider}</p>
                    <p className="font-normal text-muted-foreground text-sm">{opt.details}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{opt.duration}</span>
                        {opt.ecoFriendly && <Leaf className="w-4 h-4 text-green-500" title="Eco-Friendly"/>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <p className="font-bold text-lg">{opt.price}</p>
                <Button asChild className="w-full sm:w-auto" onClick={handleBook}>
                    <Link href={opt.bookingLink} target="_blank">Book</Link>
                </Button>
            </div>
        </Card>
    )
}


export default function SuggestBookingsPage() {
    const t = useTranslations('SuggestBookingsPage');
    const formT = useTranslations('TripPlannerPage');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SuggestTransportBookingsOutput | null>(null);
    const { toast } = useToast();
    const { currency } = useSettings();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: '',
            destination: '',
            departureDate: '',
        },
    });

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        try {
            const response = await suggestTransportBookings({
                ...values,
                currency,
            });
            setResults(response);
        } catch (error) {
            console.error('Failed to suggest bookings:', error);
            toast({ title: t('toastErrorTitle'), description: t('toastErrorDescription'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
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
                <CardTitle>
                    {t('formTitle')}
                </CardTitle>
                 <CardDescription>
                    {t('formDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name="origin" render={({ field }) => (
                                <FormItem><FormLabel>{formT('fromLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={formT('fromPlaceholder')} /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="destination" render={({ field }) => (
                                <FormItem><FormLabel>{formT('toLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={formT('toPlaceholder')} /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="departureDate" render={({ field }) => (
                                <FormItem><FormLabel>{formT('departureLabel')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <><Loader2 className="animate-spin" /> <span className="ml-2">{t('searchingButton')}</span></> : <><Search /> <span className="ml-2">{t('findButton')}</span></>}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center pt-10 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold text-muted-foreground">{t('loadingMessage')}</p>
            </div>
        )}

        {results && (
            <div className="pt-6 space-y-6">
                 <h2 className="font-headline text-2xl font-bold">{t('resultsTitle')}</h2>
                 <div className="space-y-4">
                    {results.bookingOptions.map((opt, index) => <BookingOptionCard key={index} opt={opt} />)}
                 </div>
                 {results.bookingOptions.length === 0 && (
                     <p className="text-muted-foreground text-center py-8">{t('noResults')}</p>
                 )}
            </div>
        )}
    </main>
  );
}
