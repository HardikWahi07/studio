"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PexelsImage } from "@/components/pexels-image";

type Destination = {
    id: string;
    name: string;
    rating: number;
    reviewers: string;
    imageHint: string;
    description: string;
}

export function DestinationCard({ destination }: { destination: Destination }) {
    return (
        <Link href={`/destinations/${destination.id}`} className="block">
            <Card className="overflow-hidden group h-full">
                  <div className='relative aspect-[4/5] w-full'>
                      <PexelsImage
                          query={destination.imageHint}
                          alt={destination.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 right-2">Trending</Badge>
                  </div>
                <CardContent className="p-4">
                    <h3 className="font-bold">{destination.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                        <span>{destination.rating}</span>
                        <span className='mx-1'>·</span>
                        <span>{destination.reviewers} reviews</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
