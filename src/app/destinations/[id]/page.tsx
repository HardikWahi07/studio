
"use client";
import { destinations } from '@/lib/destinations';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Plane } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function GalleryImage({ hint, index }: { hint: string, index: number }) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
      <Skeleton className={cn("absolute inset-0 rounded-lg", !isLoading && "hidden")} />
      <Image
        src={`https://source.unsplash.com/800x600/?${hint.replace(/ /g, ',')},${index}`}
        alt={`${hint} photo ${index + 1}`}
        fill
        className={cn(
            "object-cover group-hover:scale-105 transition-transform duration-300",
            isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export default function DestinationPage({ params }: { params: { id: string } }) {
  const destination = destinations.find((d) => d.id === params.id);
  const [isHeroLoading, setHeroIsLoading] = useState(true);

  if (!destination) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
      <div className="relative h-[400px] md:h-[500px] w-full">
         <Skeleton className={cn("absolute inset-0 rounded-2xl", !isHeroLoading && "hidden")} />
        <Image
          src={`https://source.unsplash.com/1920x1080/?${destination.imageHint.replace(/ /g, ',')}`}
          alt={destination.name}
          fill
          className={cn("object-cover rounded-2xl", isHeroLoading ? "opacity-0" : "opacity-100")}
          onLoad={() => setHeroIsLoading(false)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">{destination.name}</h1>
          <div className="flex items-center text-lg mt-2">
            <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
            <span>{destination.rating}</span>
            <span className="mx-2">·</span>
            <span>{destination.reviewers} reviews</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className='lg:col-span-2 space-y-8'>
                <Card>
                  <CardHeader>
                    <CardTitle>About {destination.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{destination.description}</p>
                  </CardContent>
                </Card>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-headline mb-6">Photo Gallery</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                           <GalleryImage key={index} hint={destination.imageHint} index={index} />
                        ))}
                    </div>
                </div>
            </div>
            <div className='lg:col-span-1'>
                 <Card>
                    <CardHeader>
                        <CardTitle className='font-headline'>Plan Your Visit</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <p className='text-muted-foreground'>Ready to explore {destination.name}? Find the best transport options to make your trip happen.</p>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/transport">
                                <Plane className="mr-2 h-4 w-4" />
                                Book Your Trip
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}
