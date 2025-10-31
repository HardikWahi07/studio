'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, MapPin, Users, Search, Check, Loader2, Car, Coffee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from '@/components/auth-dialog';

type AvailabilitySlot = {
    day: string;
    time: string;
    booked: boolean;
};

type SupporterService = {
    name: string;
    description: string;
    icon: 'Car' | 'Coffee';
}

type LocalSupporter = {
    id: string;
    name: string;
    bio: string;
    location: string;
    languages: string[];
    avatarUrl: string;
    services: SupporterService[];
    availability: AvailabilitySlot[];
};

// Mock data for hackathon stability
const mockSupporters: LocalSupporter[] = [
    {
        id: "supporter-maria",
        name: "Maria G.",
        bio: "Born and raised in Madrid! I'm a foodie and history buff. Happy to share the best tapas spots or help you navigate the metro. I work near the Prado Museum.",
        location: "Madrid, Spain",
        languages: ["Spanish", "English"],
        avatarUrl: "https://i.pravatar.cc/150?u=maria",
        services: [
            { name: 'Welcome Walk & Chat', description: 'A 1-hour introductory walk.', icon: 'Coffee' },
            { name: 'Airport Welcome Ride', description: 'Pickup from MAD airport.', icon: 'Car' }
        ],
        availability: [
            { day: 'Monday', time: '10:00 AM', booked: false },
            { day: 'Monday', time: '2:00 PM', booked: false },
            { day: 'Wednesday', time: '5:00 PM', booked: false },
            { day: 'Friday', time: '11:00 AM', booked: true },
        ]
    },
    {
        id: "supporter-kenji",
        name: "Kenji Tanaka",
        bio: "I'm a university student in Tokyo. I love photography and exploring quiet neighborhoods. I can help you find cool vintage stores or the best ramen.",
        location: "Tokyo, Japan",
        languages: ["Japanese", "English"],
        avatarUrl: "https://i.pravatar.cc/150?u=kenji",
        services: [
            { name: 'Shibuya Crossing Tour', description: 'A guided tour of the famous crossing.', icon: 'Coffee' },
        ],
        availability: [
            { day: 'Tuesday', time: '6:00 PM', booked: false },
            { day: 'Thursday', time: '7:00 PM', booked: false },
            { day: 'Saturday', time: '2:00 PM', booked: false },
        ]
    },
    {
        id: "supporter-aisha",
        name: "Aisha Khan",
        bio: "I'm a designer living in Mumbai. I can give you tips on the best street food, fabric markets, and how to get around the city like a local.",
        location: "Mumbai, India",
        languages: ["Hindi", "English", "Marathi"],
        avatarUrl: "https://i.pravatar.cc/150?u=aisha",
         services: [
            { name: 'Welcome Ride', description: 'Pickup from your hotel.', icon: 'Car' }
        ],
        availability: [
            { day: 'Monday', time: '1:00 PM', booked: false },
            { day: 'Tuesday', time: '1:00 PM', booked: false },
            { day: 'Wednesday', time: '1:00 PM', booked: false },
            { day: 'Thursday', time: '1:00 PM', booked: false },
            { day: 'Friday', time: '1:00 PM', booked: false },
        ]
    },
];

const serviceIcons = {
    Car: <Car className="w-4 h-4" />,
    Coffee: <Coffee className="w-4 h-4" />,
}

export default function LocalSupportersPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [searchLocation, setSearchLocation] = useState('');
    const [supporters, setSupporters] = useState<LocalSupporter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedSupporter, setSelectedSupporter] = useState<LocalSupporter | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [selectedService, setSelectedService] = useState<SupporterService | null>(null);
    const [isProcessingBooking, setIsProcessingBooking] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    // Initial load of mock data
    useEffect(() => {
        setSupporters(mockSupporters);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (searchLocation.trim() === '') {
                setSupporters(mockSupporters);
            } else {
                const filtered = mockSupporters.filter(s => 
                    s.location.toLowerCase().includes(searchLocation.toLowerCase())
                );
                setSupporters(filtered);
            }
            setIsLoading(false);
        }, 1000);
    }

    const openBookingModal = (supporter: LocalSupporter, service: SupporterService, slot: AvailabilitySlot) => {
        setSelectedSupporter(supporter);
        setSelectedService(service);
        setSelectedSlot(slot);
        
        if (!user) {
            setIsAuthDialogOpen(true);
            return;
        }

        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!firestore || !user || !selectedSupporter || !selectedSlot || !selectedService) return;

        setIsProcessingBooking(true);

        try {
            // In a real app, this would commit to Firestore. For the demo, we'll just show a success message.
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // OPTIONAL: To make the demo feel more real, we can update the local state
            const updatedSupporters = supporters.map(sup => {
                if (sup.id === selectedSupporter.id) {
                    const updatedAvailability = sup.availability.map(s => 
                        s.day === selectedSlot.day && s.time === selectedSlot.time ? { ...s, booked: true } : s
                    );
                    return { ...sup, availability: updatedAvailability };
                }
                return sup;
            });
            setSupporters(updatedSupporters);


            toast({
                title: 'Booking Confirmed!',
                description: `Your ${selectedService.name} with ${selectedSupporter.name} is set.`,
            });
            
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

        if (!supporters?.length) {
            return (
                 <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">{`No Supporters Found in ${searchLocation}`}</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                       We're still building our network. Try searching for another city, or check back soon!
                    </p>
                </Card>
            );
        }

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
                        <CardFooter className="flex-col gap-4 items-start">
                             <div className="w-full">
                                 <h4 className="font-bold text-sm mb-2">Book a Service</h4>
                                  {supporter.services?.map((service) => (
                                    <div key={service.name} className="p-3 rounded-md bg-secondary mb-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className='font-semibold text-foreground flex items-center gap-2'>
                                                    {serviceIcons[service.icon]}
                                                    {service.name}
                                                </p>
                                                <p className='text-xs text-muted-foreground mt-1'>{service.description}</p>
                                            </div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                     <Button size="sm">Book</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Book "{service.name}" with {supporter.name}</DialogTitle>
                                                        <DialogDescription>Select an available time slot below.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-4">
                                                        {supporter.availability?.map((slot, index) => (
                                                            <Button 
                                                                key={index}
                                                                variant={slot.booked ? "secondary" : "outline"}
                                                                disabled={slot.booked}
                                                                onClick={() => openBookingModal(supporter, service, slot)}
                                                                className="text-xs"
                                                            >
                                                                {slot.day.substring(0,3)}, {slot.time}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                 ))}
                             </div>
                            <Button className="w-full" variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
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
                            You are booking a "{selectedService?.name}" with <span className="font-bold">{selectedSupporter?.name}</span> for <span className="font-bold">{selectedSlot?.day} at {selectedSlot?.time}</span>.
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
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">Local Supporters</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Connect with friendly locals who are happy to help. Get tips, ask questions, or just get a friendly suggestion when you're feeling lost.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Find a Supporter</CardTitle>
                        <CardDescription>Enter a city to find locals who can help. We'll try to autodetect your location.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input 
                                placeholder="e.g., Madrid, Spain"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {renderContent()}
            </main>
        </>
    );
}
