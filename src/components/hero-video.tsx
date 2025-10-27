
"use client";

import React, { useState, useEffect, useRef } from 'react';

const API_KEY = "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";
const query = "green valley river drone 4k";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const updateProgress = () => {
      setProgress(oldProgress => {
        const newProgress = oldProgress + Math.random() * 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    };

    const startProgress = () => {
      progressInterval = setInterval(updateProgress, 200);
    };

    const completeProgress = () => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    
    const loadFastFallback = () => {
      const fallbacks = [
        "https://cdn.coverr.co/videos/coverr-river-valley-8879/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-aerial-view-of-forest-and-river-1568/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-green-forest-from-above-5508/1080p.mp4"
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      if (videoRef.current) {
        videoRef.current.src = randomFallback;
      }
    };

    const loadRandomVideoFast = async () => {
      try {
        startProgress();
        const res = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&page=${Math.floor(Math.random() * 10) + 1}`,
          { 
            headers: { Authorization: API_KEY }
          }
        );
        const data = await res.json();

        if (data.videos?.length > 0) {
          const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
          const files = randomVideo.video_files;
          const bestFile = files.find(v => v.quality?.includes('hd')) || files[0];
          
          if (videoRef.current) {
            videoRef.current.src = bestFile.link;
          }
        } else {
          throw new Error("No videos found");
        }
      } catch (err) {
        console.error("Video load error:", err);
        loadFastFallback();
      }
    };

    const videoEl = videoRef.current;
    if (videoEl) {
        videoEl.onloadeddata = () => {
            completeProgress();
            videoEl.play().catch(e => console.log("Autoplay waiting for interaction"));
        };
    }
    
    loadRandomVideoFast();
    
    const handleClick = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play().catch(e => console.log("Still blocked"));
        }
    }
    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(progressInterval);
      document.removeEventListener('click', handleClick);
      if(videoEl) {
        videoEl.onloadeddata = null;
      }
    };
  }, []);

  return (
    <>
      {isLoading && (
        <div id="loadingScreen" className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center">
          <div className="w-1/3 bg-gray-700 rounded-full h-1.5">
            <div id="progressBar" className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        id="heroVideo"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        muted
        loop
        playsInline
        preload="auto"
      />
    </>
  );
}
