
"use client";

import { Leaf } from 'lucide-react';
import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  progressBarRef: React.Ref<HTMLDivElement>;
}

export const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(({ progressBarRef }, ref) => {
  return (
    <div ref={ref} id="loadingScreen" className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#001a14] to-[#00382e] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-out">
      <div className="flex items-center gap-3 mb-8 loading-logo">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 border-2 border-gray-200">
             <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 text-primary"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
                <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M10 13a4 4 0 0 0-1.5 7.5" />
                <path d="M14 13a4 4 0 0 1 1.5 7.5" />
              </svg>
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
