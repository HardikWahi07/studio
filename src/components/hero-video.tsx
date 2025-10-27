
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export function HeroVideo() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-dashboard');

  return (
    <>
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-white/60 dark:bg-black/40" />
    </>
  );
}
