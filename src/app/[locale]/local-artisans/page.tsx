
'use client';

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PexelsImage } from "@/components/pexels-image";
import { useTranslations } from "next-intl";
import { useOnVisible } from '@/hooks/use-on-visible';
import { cn } from '@/lib/utils';

const artisans = [
  {
    id: "artisan-pottery",
    name: "Elena's Pottery Studio",
    description: "Hand-thrown ceramics and pottery workshops. Take a piece of local art home with you.",
    category: "Handicrafts",
    imageHint: "pottery hands"
  },
  {
    id: "artisan-textiles",
    name: "The Weaver's Knot",
    description: "Discover traditional weaving techniques and purchase beautiful, handwoven textiles.",
    category: "Textiles",
    imageHint: "weaving loom"
  },
  {
    id: "artisan-food",
    name: "Mama Rosa's Kitchen",
    description: "Join a cooking class to learn the secrets of authentic regional cuisine.",
    category: "Culinary Experience",
    imageHint: "fresh pasta"
  },
  {
    id: "artisan-woodwork",
    name: "Old Forest Woodcraft",
    description: "Intricate wood carvings and custom furniture made from sustainably sourced timber.",
    category: "Woodwork",
    imageHint: "wood carving"
  },
  {
    id: "artisan-jewelry",
    name: "Silver & Stone",
    description: "Unique, handmade jewelry inspired by local nature and mythology.",
    category: "Jewelry",
    imageHint: "jewelry making"
  },
  {
    id: "artisan-painting",
    name: "Canvas & Coast",
    description: "Plein air painting sessions with a local artist capturing stunning seaside views.",
    category: "Art & Painting",
    imageHint: "canvas painting"
  },
];

export default function LocalArtisansPage() {
  const t = useTranslations('LocalArtisansPage');
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnVisible(containerRef, false);

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('description')}
        </p>
      </div>

      <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {artisans.map((artisan, index) => {
          return (
            <Card key={artisan.id} className={cn("flex flex-col group overflow-hidden fade-in-up", { 'visible': isVisible })} style={{ transitionDelay: `${index * 100}ms` }}>
              <CardHeader>
                  <div className="aspect-video w-full overflow-hidden rounded-lg -mt-2 -mx-2">
                    <PexelsImage
                      query={artisan.imageHint}
                      alt={artisan.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                 <CardTitle className="font-headline text-xl pt-4">{artisan.name}</CardTitle>
                 <CardDescription className="text-accent-foreground/80 font-semibold">{artisan.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{artisan.description}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full bg-transparent border-accent text-accent hover:bg-accent/10">
                    {t('connectButton')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
