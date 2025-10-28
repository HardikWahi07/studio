
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
    Plane, Train, Bus, Leaf,
    Bike, TramFront, Car, Footprints, Clock, MapPin, Info
} from "lucide-react";
import type { PlanTripOutput, TransportSegment, BookingOption } from '@/ai/flows/plan-trip.types';

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

function BookingOptionDisplay({ opt }: { opt: BookingOption }) {
     return (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
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
    )
}


export function TripItinerary({ results }: { results: PlanTripOutput }) {
  return (
    <div className="space-y-6">
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
                    <BookingOptionDisplay key={idx} opt={opt} />
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
  );
}
