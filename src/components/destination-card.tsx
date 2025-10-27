
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Destination = {
    id: string;
    name: string;
    rating: number;
    reviewers: string;
    imageHint: string;
    description: string;
}

export function DestinationCard({ destination }: { destination: Destination }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Link href={`/destinations/${destination.id}`} className="block">
            <Card className="overflow-hidden group h-full">
                <div className='relative aspect-[4/5] w-full'>
                    <Skeleton className={cn("absolute inset-0 rounded-b-none", !isLoading && "hidden")} />
                    <Image
                        src={`https://source.unsplash.com/800x1000/?${destination.imageHint.replace(/ /g, ',')}`}
                        alt={destination.name}
                        fill
                        className={cn(
                            "object-cover group-hover:scale-105 transition-transform duration-300",
                            isLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setIsLoading(false)}
                        data-ai-hint={destination.imageHint}
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
