
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

// This is a simplified in-memory cache to avoid re-fetching images on re-renders within a session.
const imageCache = new Map<string, string>();

const API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";

async function getPexelsImage(query: string): Promise<string> {
    if (imageCache.has(query)) {
        return imageCache.get(query)!;
    }

    try {
        const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
            { headers: { Authorization: API_KEY } }
        );

        if (!res.ok) {
            console.error(`Pexels API error: ${res.status}`);
            return "https://placehold.co/800x600/000000/FFFFFF/png?text=Error";
        }
        
        const data = await res.json();
    
        if (data.photos?.length > 0) {
            const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
            const imageUrl = randomPhoto.src.large;
            imageCache.set(query, imageUrl);
            return imageUrl;
        } else {
             return `https://placehold.co/800x600/EEE/31343C/png?text=Not+Found`;
        }
    } catch (err) {
        console.error("Pexels fetch error:", err);
        return "https://placehold.co/800x600/000000/FFFFFF/png?text=Error";
    }
}

type PexelsImageProps = Omit<React.ComponentProps<typeof Image>, "src"> & {
    query: string;
};

export function PexelsImage({ query, className, ...props }: PexelsImageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        // Use a random number for caching to ensure different images on different renders
        // but stable image on re-renders of the same component instance.
        const cacheKey = `${query}-${Math.floor(Math.random() * 1000)}`;

        getPexelsImage(cacheKey).then(url => {
            if (isMounted) {
                setImageUrl(url);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [query]);

    return (
        <div className={cn("relative w-full h-full", className)}>
            {isLoading && <Skeleton className="w-full h-full" />}
            {imageUrl && (
                <Image
                    src={imageUrl}
                    className={cn(
                        "transition-opacity duration-500",
                        isLoading ? "opacity-0" : "opacity-100",
                         props.fill ? "object-cover" : ""
                    )}
                    onLoad={() => setIsLoading(false)}
                    {...props}
                    alt={props.alt || query}
                />
            )}
        </div>
    );
}
