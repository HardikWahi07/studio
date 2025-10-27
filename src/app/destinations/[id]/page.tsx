
import { destinations } from '@/lib/destinations';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';

export default function DestinationPage({ params }: { params: { id: string } }) {
  const destination = destinations.find((d) => d.id === params.id);

  if (!destination) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
      <div className="relative h-[400px] md:h-[500px] w-full">
        <Image
          src={`https://source.unsplash.com/1600x900/?${destination.imageHint}`}
          alt={destination.name}
          fill
          className="object-cover rounded-2xl"
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
                    <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg group">
                        <Image
                            src={`https://source.unsplash.com/800x600/?${destination.imageHint}&sig=${index}-${Math.random()}`}
                            alt={`${destination.name} photo ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}
