
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
    Plane, Train, Bus, Leaf, Star, Hotel,
    Bike, TramFront, Car, Footprints, Clock, MapPin, Info, CarFront, DollarSign, Download, Loader2
} from "lucide-react";
import type { PlanTripOutput, TransportSegment, HotelOption } from '@/ai/flows/plan-trip.types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const transportIcons: { [key: string]: React.ReactNode } = {
    Walk: <Footprints className="h-5 w-5 text-green-500" />,
    Walking: <Footprints className="h-5 w-5 text-green-500" />,
    Metro: <TramFront className="h-5 w-5 text-blue-500" />,
    Bus: <Bus className="h-5 w-5 text-orange-500" />,
    Taxi: <Car className="h-5 w-5 text-yellow-500" />,
    'E-bike': <Bike className="h-5 w-5 text-green-500" />,
    Bicycling: <Bike className="h-5 w-5 text-green-500" />,
    Train: <Train className="h-5 w-5 text-purple-500" />,
    flight: <Plane className="h-5 w-5 text-sky-500" />,
    train: <Train className="h-5 w-5 text-purple-500" />,
    bus: <Bus className="h-5 w-5 text-orange-500" />,
    "Auto-rickshaw": <Car className="h-5 w-5 text-yellow-500" />,
    Driving: <CarFront className="h-5 w-5 text-gray-500" />,
    driving: <CarFront className="h-5 w-5 text-gray-500" />,
    Transit: <TramFront className="h-5 w-5 text-blue-500" />,
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

function HotelOptionDisplay({ opt }: { opt: HotelOption }) {
     return (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
            <div className="flex items-center gap-4">
                <Hotel className="h-5 w-5 text-blue-500" />
                <div>
                    <p className="font-bold">{opt.name} <span className="font-normal text-muted-foreground text-sm">{opt.style}</span></p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>{opt.rating}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <p className="font-bold text-lg">{opt.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                <Button asChild className="w-full sm:w-auto">
                    <Link href={opt.bookingLink} target="_blank">Book Now</Link>
                </Button>
            </div>
        </Card>
    )
}


export function TripItinerary({ results }: { results: PlanTripOutput }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [accordionValue, setAccordionValue] = useState<string[]>(['item-0']);

    const handleDownloadPdf = () => {
        const input = document.getElementById('itinerary-content');
        if (!input) {
            console.error("PDF generation failed: Could not find itinerary content.");
            return;
        }

        setIsDownloading(true);
        // Expand all accordion items before capturing
        const allItemValues = results.itinerary.map((_, index) => `item-${index}`);
        setAccordionValue(allItemValues);

        // Allow a brief moment for the DOM to update with all accordions open
        setTimeout(() => {
            // Add a class to apply specific print/PDF styles
            document.body.classList.add('pdf-generating');

            html2canvas(input, {
                scale: 2, // Increase resolution for better quality
                useCORS: true, // Needed for external images
                backgroundColor: '#000000', // Force black background
                onclone: (document) => {
                    // This ensures that during the cloning process for canvas rendering,
                    // the accordion content areas do not get hidden by animation classes.
                    const contentElements = document.querySelectorAll('.radix-accordion-content-closed');
                    contentElements.forEach(el => {
                        el.classList.remove('radix-accordion-content-closed');
                        el.classList.add('radix-accordion-content-open');
                    });
                }
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // Calculate the ratio of the canvas and the height of the image in the PDF
                const ratio = canvasWidth / canvasHeight;
                const imgHeight = pdfWidth / ratio;
                
                let heightLeft = imgHeight;
                let position = 0;

                // Add the first page
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                // Add more pages if the content is taller than one page
                while (heightLeft > 0) {
                    position = position - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
                
                pdf.save(`${results.tripTitle.replace(/\s+/g, '-')}.pdf`);
            }).finally(() => {
                // Cleanup after generation
                document.body.classList.remove('pdf-generating');
                setIsDownloading(false);
                // Optionally, revert to only the first item being open
                setAccordionValue(['item-0']);
            });
        }, 100); // 100ms delay for DOM update
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-center">
                 <Button onClick={handleDownloadPdf} variant="outline" disabled={isDownloading}>
                    {isDownloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download as PDF
                        </>
                    )}
                </Button>
            </div>
            <div id="itinerary-content">
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

                {results.hotelOptions?.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Hotel Suggestions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {results.hotelOptions.map((opt, idx) => (
                                <HotelOptionDisplay key={idx} opt={opt} />
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Accordion type="multiple" value={accordionValue} onValueChange={setAccordionValue} className="w-full">
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
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-base">{activity.time} - {activity.description}</p>
                                        {activity.cost && (
                                            <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                                                <DollarSign className="w-4 h-4" />
                                                {activity.cost}
                                            </div>
                                        )}
                                    </div>
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
        </div>
    );
}
