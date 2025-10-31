'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';
import { Plane, Train, Bus, Hotel, Car, Walk, Bike, Tram, Mountain, Utensils, Landmark, ShoppingBag, Leaf, BadgeEuro, Sparkles, Building2, Ticket } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';

interface TripItineraryProps {
  results: PlanTripOutput;
}

const transportIcons: { [key: string]: React.ReactNode } = {
    flight: <Plane className="h-5 w-5 text-sky-500" />,
    train: <Train className="h-5 w-5 text-purple-500" />,
    bus: <Bus className="h-5 w-5 text-orange-500" />,
    driving: <Car className="h-5 w-5 text-gray-500" />,
    metro: <Tram className="h-5 w-5" />,
    walk: <Walk className="h-5 w-5" />,
    bike: <Bike className="h-5 w-5" />,
};

const activityIcons: { [key: string]: React.ReactNode } = {
    food: <Utensils className="h-5 w-5 text-amber-600" />,
    sightseeing: <Landmark className="h-5 w-5 text-blue-600" />,
    activity: <Mountain className="h-5 w-5 text-green-600" />,
    shopping: <ShoppingBag className="h-5 w-5 text-pink-600" />,
    accommodation: <Building2 className="h-5 w-5 text-indigo-600" />,
    travel: <Ticket className="h-5 w-5 text-gray-600" />,
};

function determineActivityType(description: string): keyof typeof activityIcons {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner') || lowerDesc.includes('breakfast') || lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('cafe')) {
        return 'food';
    }
    if (lowerDesc.includes('visit') || lowerDesc.includes('tour') || lowerDesc.includes('museum') || lowerDesc.includes('palace') || lowerDesc.includes('cathedral') || lowerDesc.includes('monument')) {
        return 'sightseeing';
    }
    if (lowerDesc.includes('check-in') || lowerDesc.includes('check in') || lowerDesc.includes('hotel')) {
        return 'accommodation';
    }
     if (lowerDesc.includes('depart') || lowerDesc.includes('arrive') || lowerDesc.includes('flight') || lowerDesc.includes('train')) {
        return 'travel';
    }
    if (lowerDesc.includes('hike') || lowerDesc.includes('activity') || lowerDesc.includes('walk')) {
        return 'activity';
    }
    if (lowerDesc.includes('shop') || lowerDesc.includes('market')) {
        return 'shopping';
    }
    return 'sightseeing';
}


export function TripItinerary({ results }: TripItineraryProps) {
  return (
    <div className="space-y-8">

      {/* Main Booking Options */}
      {results.bookingOptions && results.bookingOptions.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Main Journey Booking Options</CardTitle>
                  <CardDescription>AI-suggested ways to get to your destination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {results.bookingOptions.map((opt, idx) => (
                      <Card key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 transition-shadow hover:shadow-md">
                          <div className="flex items-center gap-4">
                              {transportIcons[opt.type]}
                              <div>
                                  <div className="flex items-center gap-2">
                                      <p className="font-bold">{opt.provider}</p>
                                      {opt.ecoFriendly && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Eco-Friendly</Badge>}
                                  </div>
                                  <p className="font-normal text-muted-foreground text-sm">{opt.details}</p>
                                  <p className="text-sm text-muted-foreground mt-1">Duration: {opt.duration}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto ml-auto sm:ml-0">
                            <p className="font-bold text-lg">{opt.price}</p>
                            <Button asChild size="sm">
                                <Link href={opt.bookingLink} target="_blank">Book Now</Link>
                            </Button>
                          </div>
                      </Card>
                  ))}
              </CardContent>
          </Card>
      )}
      
      {/* Hotel Options */}
      {results.hotelOptions && results.hotelOptions.length > 0 && (
           <Card>
              <CardHeader>
                  <CardTitle>Accommodation Options</CardTitle>
                  <CardDescription>Recommended places to stay based on your preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {results.hotelOptions.map((opt, idx) => (
                      <Card key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 transition-shadow hover:shadow-md">
                         <div className="flex items-center gap-4">
                            <Hotel className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="font-bold">{opt.name} <span className="font-normal text-muted-foreground text-sm">{opt.style}</span></p>
                                <p className="text-sm text-muted-foreground mt-1">Rating: {opt.rating} / 5</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 w-full sm:w-auto ml-auto sm:ml-0">
                            <p className="font-bold text-lg">{opt.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                            <Button asChild size="sm">
                                <Link href={opt.bookingLink} target="_blank">Book Now</Link>
                            </Button>
                         </div>
                      </Card>
                  ))}
              </CardContent>
          </Card>
      )}

      {/* Day-by-day Itinerary */}
      <Card>
        <CardHeader>
          <CardTitle>Day-by-Day Itinerary</CardTitle>
          <CardDescription>Your detailed travel plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
            {results.itinerary.map((day) => (
              <AccordionItem value={`day-${day.day}`} key={day.day}>
                <AccordionTrigger>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Day {day.day}: {day.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">{day.summary}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pl-2 border-l-2 border-primary ml-2">
                    {day.activities.map((activity, index) => {
                      const activityType = determineActivityType(activity.description);
                      return (
                        <div key={index} className="relative pl-8">
                           <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                                {activityIcons[activityType]}
                           </div>
                           <p className="font-bold">{activity.time} - {activity.description}</p>
                           <p className="text-sm text-muted-foreground">{activity.location}</p>
                           <p className="text-sm mt-1">{activity.details}</p>
                           {activity.cost && <p className="text-sm font-semibold text-primary mt-1">Cost: {activity.cost}</p>}
                           {activity.transportToNext && (
                               <div className="mt-4 flex items-center text-xs text-muted-foreground gap-2 border-t pt-2">
                                  {transportIcons[activity.transportToNext.mode.toLowerCase()] ?? <Car />}
                                  <span>{activity.transportToNext.duration} to next activity</span>
                               </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

    </div>
  );
}
