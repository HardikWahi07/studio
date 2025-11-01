
"use client";

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  progressBarRef: React.Ref<HTMLDivElement>;
}

export const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(({ progressBarRef }, ref) => {
  return (
    <div ref={ref} id="loadingScreen" className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#001a14] to-[#00382e] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-out">
      <div className="flex items-center gap-3 mb-4 loading-logo">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1.5 border-2 border-gray-200">
             <Image src="/logo.png" alt="TripMind Logo" width={48} height={48} />
        </div>
        <h1 className="text-4xl font-black text-white font-headline">TripMind</h1>
      </div>
      <div className="mb-4 text-lg font-semibold tracking-wider text-white loading-text">
        LOADING YOUR NEXT ADVENTURE
      </div>
      <div className="w-52 h-1 overflow-hidden rounded-full bg-primary/20 loading-progress">
        <div id="progressBar" ref={progressBarRef} className="w-0 h-full transition-all duration-300 ease-out rounded-full bg-primary loading-progress-bar"></div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
