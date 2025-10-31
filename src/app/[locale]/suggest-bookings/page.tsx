
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CityCombobox } from '@/components/city-combobox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Plane, Train, Bus, Leaf, CarFront, Clock, BadgeEuro, Sparkles, CalendarIcon, ChevronsRight, Milestone, AlertTriangle, BookMarked } from 'lucide-react';
import type { BookingOption, PlanTripOutput } from '@/ai/flows/plan-trip.types';
import { suggestTransportBookings, SuggestTransportBookingsOutput } from '@/ai/flows/suggest-transport-bookings';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/use-translations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PexelsImage } from '@/components/pexels-image';
import Link from 'next/link';

type Trip = PlanTripOutput & {
  id: string;
  destination: string;
  tripTitle: string;
  origin: string;
  startDate: string;
};

const formSchema = z.object({
    origin: z.string().min(1, 'Origin is required.'),
    destination: z.string().min(1, 'Destination is required.'),
    departureDate: z.date({
        required_error: "A departure date is required.",
    }),
});

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="h-6 w-6 text-sky-500" />,
    train: <Train className="h-6 w-6 text-purple-500" />,
    bus: <Bus className="h-6 w-6 text-orange-500" />,
    driving: <CarFront className="h-6 w-6 text-gray-500" />,
    rickshaw: <CarFront className="h-6 w-6 text-yellow-500" />,
    taxi: <CarFront className="h-6 w-6 text-red-500" />,
    walk: <Milestone className="h-6 w-6 text-green-500" />,
};


function BookingOptionCard({ opt, recommendation }: { opt: BookingOption, recommendation?: 'Best' | 'Cheapest' | 'Eco-Friendly' }) {
    const { toast } = useToast();
    
    const handleBook = () => {
        toast({
            title: "Demo: Opening Booking Site",
            description: `Redirecting to ${opt.provider} to complete your booking.`,
        });
        window.open(opt.bookingLink, '_blank');
    }

    const recommendationBadges = {
        'Best': <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200"><Sparkles className="w-3 h-3 mr-1"/>Best Option</Badge>,
        'Cheapest': <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><BadgeEuro className="w-3 h-3 mr-1"/>Cheapest</Badge>,
        'Eco-Friendly': <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>,
    }

    const availabilityColors = {
        'Available': 'bg-green-100 text-green-800 border-green-200',
        'Waitlist': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Sold Out': 'bg-red-100 text-red-800 border-red-200',
        'N/A': 'bg-gray-100 text-gray-800 border-gray-200',
        'Unknown': 'bg-gray-100 text-gray-800 border-gray-200',
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
                        {opt.availability && <Badge variant={'secondary'} className={cn(availabilityColors[opt.availability as keyof typeof availabilityColors] || availabilityColors.Unknown)}>{opt.availability}</Badge>}
                        {opt.ecoFriendly && !recommendation && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto ml-auto sm:ml-0">
                <p className="font-bold text-lg">{opt.price}</p>
                <Button className="w-full sm:w-auto" onClick={handleBook}>
                    Book
                </Button>
            </div>
        </Card>
    )
}

function SelectTripDialog({ onTripSelected, form }: { onTripSelected: (trip: Trip) => void, form: any }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const tripsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'trips'));
  }, [user, firestore]);

  const { data: trips, isLoading } = useCollection<Trip>(tripsQuery);
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select a Planned Trip</DialogTitle>
        <DialogDescription>Choose a saved trip to auto-fill the journey details.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
        {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
        {!isLoading && !trips?.length && (
          <div className="text-center text-muted-foreground p-4">
            <p>You haven't planned any trips yet.</p>
            <Button variant="link" asChild><Link href="/trip-planner">Plan a new trip</Link></Button>
          </div>
        )}
        {trips?.map(trip => (
          <DialogTrigger asChild key={trip.id}>
            <button
              onClick={() => onTripSelected(trip)}
              className="w-full text-left p-2 rounded-md hover:bg-accent flex items-center gap-4"
            >
                <div className="w-24 h-16 rounded-md overflow-hidden relative">
                    <PexelsImage query={trip.destination} alt={trip.destination} fill className="object-cover" />
                </div>
                <div className='flex-1'>
                    <p className="font-semibold">{trip.tripTitle}</p>
                    <p className="text-sm text-muted-foreground">{trip.origin} to {trip.destination}</p>
                </div>
            </button>
          </DialogTrigger>
        ))}
      </div>
    </DialogContent>
  );
}


export default function SuggestBookingsPage() {
    const t = useTranslations();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SuggestTransportBookingsOutput | null>(null);
    const { currency } = useSettings();
    const { toast } = useToast();
    const { user } = useUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: '',
            destination: '',
        },
    });

    const hasWaitlistTrains = results?.journey.some(leg => leg.options.some(opt => opt.type === 'train' && opt.availability === 'Waitlist'));

    async function handleSearch(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        
        try {
            const response = await suggestTransportBookings({
                ...values,
                departureDate: format(values.departureDate, 'yyyy-MM-dd'),
                currency: currency,
            });
            setResults(response);
        } catch(e) {
            console.error("Failed to suggest transport bookings", e);
            toast({
                variant: 'destructive',
                title: t('SuggestBookingsPage.toastErrorTitle'),
                description: t('SuggestBookingsPage.toastErrorDescription'),
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    function handleTripSelected(trip: Trip) {
        form.setValue('origin', trip.origin);
        form.setValue('destination', trip.destination);
        if (trip.startDate) {
            form.setValue('departureDate', new Date(trip.startDate));
        }
    }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('SuggestBookingsPage.title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('SuggestBookingsPage.description')}
        </p>
      </div>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>
                            {t('SuggestBookingsPage.formTitle')}
                        </CardTitle>
                        <CardDescription>
                            {t('SuggestBookingsPage.formDescription')}
                        </CardDescription>
                    </div>
                    {user && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline"><BookMarked className="mr-2"/>Select from My Trips</Button>
                            </DialogTrigger>
                            <SelectTripDialog onTripSelected={handleTripSelected} form={form} />
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormField control={form.control} name="origin" render={({ field }) => (
                                <FormItem><FormLabel>{t('SuggestBookingsPage.fromLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('SuggestBookingsPage.fromPlaceholder')} /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="destination" render={({ field }) => (
                                <FormItem><FormLabel>{t('SuggestBookingsPage.toLabel')}</FormLabel><CityCombobox value={field.value} onValueChange={field.onChange} placeholder={t('SuggestBookingsPage.toPlaceholder')} /><FormMessage /></FormItem>
                            )} />
                            <FormField
                                control={form.control}
                                name="departureDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                    <FormLabel>{t('SuggestBookingsPage.departureLabel')}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <><Loader2 className="animate-spin mr-2" /> {t('SuggestBookingsPage.searchingButton')}</> : <><Search className="mr-2" /> {t('SuggestBookingsPage.findButton')}</>}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center pt-10 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold text-muted-foreground">{t('SuggestBookingsPage.loadingMessage')}</p>
            </div>
        )}

        {results && (
            <div className="pt-6 space-y-6">
                 <h2 className="font-headline text-2xl font-bold">{t('SuggestBookingsPage.resultsTitle')}</h2>
                 
                 {hasWaitlistTrains && (
                    <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-900">
                        <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                        <AlertTitle>Waitlist Information</AlertTitle>
                        <AlertDescription>
                           *Wait list does not guarantee a ticket, book at your own risk*
                        </AlertDescription>
                    </Alert>
                 )}

                 <div className="space-y-4">
                    {results.journey.length > 0 ? (
                       results.journey.map((leg, legIndex) => (
                           <div key={leg.leg}>
                             <Card className="bg-secondary p-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-sans">{leg.leg}</span>
                                    {leg.description}
                                </CardTitle>
                                <CardContent className="pt-4 space-y-4">
                                    {leg.options.length > 0 ? (
                                        leg.options.map((opt, optIndex) => <BookingOptionCard key={optIndex} opt={opt} />)
                                    ) : (
                                        <p className="text-muted-foreground text-center">No options found for this leg.</p>
                                    )}
                                </CardContent>
                             </Card>
                              {legIndex < results.journey.length - 1 && (
                                <div className="flex justify-center my-4">
                                    <ChevronsRight className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                            )}
                           </div>
                       ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">{t('SuggestBookingsPage.noResults')}</p>
                    )}
                 </div>
            </div>
        )}
    </main>
  );
}

    