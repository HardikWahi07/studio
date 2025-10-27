
"use client";

import { Leaf } from 'lucide-react';
import React from 'react';

interface LoadingScreenProps {
  progressBarRef: React.Ref<HTMLDivElement>;
}

export const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(({ progressBarRef }, ref) => {
  return (
    <div ref={ref} id="loadingScreen" className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#001a14] to-[#00382e] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-out">
      <div className="flex items-center gap-3 mb-8 loading-logo">
        <div className="p-2 bg-primary rounded-md">
            <Leaf className="w-8 h-8 text-background animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-primary">TripMind</h1>
      </div>
      <div className="relative w-32 h-32 mb-8 loading-animation">
        <div className="absolute w-full h-full border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute w-[80%] h-[80%] top-[10%] left-[10%] border-4 rounded-full border-primary/20 border-t-primary animate-spin-reverse"></div>
        <div className="absolute w-[60%] h-[60%] top-[20%] left-[20%] border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
      </div>
      <div className="mb-4 text-lg font-semibold tracking-wider text-primary loading-text">
        LOADING YOUR NEXT ADVENTURE
      </div>
      <div className="w-52 h-1 overflow-hidden rounded-full bg-primary/20 loading-progress">
        <div id="progressBar" ref={progressBarRef} className="w-0 h-full transition-all duration-300 ease-out rounded-full bg-primary loading-progress-bar"></div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
