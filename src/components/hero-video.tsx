
'use client';

import React, { useState, useEffect, useRef } from 'react';

// 🎥 Faster random video loader
const API_KEY = "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";
const query = "green valley river drone 4k";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingScreenRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let progress = 0;

    function updateProgress() {
      progress += Math.random() * 5;
      if (progress > 95) progress = 95; // Don't reach 100% until video is loaded
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
    }

    function startProgress() {
      progressInterval = setInterval(updateProgress, 200);
    }

    function completeProgress() {
      clearInterval(progressInterval);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '100%';
      }
      
      // Hide loading screen after a short delay
      setTimeout(() => {
        if (loadingScreenRef.current) {
            loadingScreenRef.current.classList.add('opacity-0', 'pointer-events-none');
        }
        if (videoRef.current) {
            videoRef.current.classList.add('opacity-100');
        }
        setIsLoading(false);
      }, 500);
    }

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
    
    async function loadRandomVideoFast() {
      try {
        startProgress();
        
        const res = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&page=${Math.floor(Math.random() * 10) + 1}`,
          { 
            headers: { Authorization: API_KEY }
          }
        );

        if (!res.ok) {
            throw new Error(`Pexels API error: ${res.status}`);
        }
        
        const data = await res.json();
    
        if (data.videos?.length > 0) {
          const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
          const files = randomVideo.video_files;
    
          const bestFile = files.find(v => v.quality === 'hd') || files[0];
    
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
    }

    loadRandomVideoFast();

    const videoEl = videoRef.current;
    if (videoEl) {
        videoEl.onloadeddata = () => {
            completeProgress();
            videoEl.play().catch(e => console.log("Autoplay waiting for interaction"));
        };
    }

    const handleClick = () => {
      if (videoEl?.paused) {
        videoEl.play().catch(e => console.log("Still blocked"));
      }
    }
    
    document.addEventListener('click', handleClick);

    return () => {
        clearInterval(progressInterval);
        document.removeEventListener('click', handleClick);
        if (videoEl) {
            videoEl.onloadeddata = null;
        }
    }
  }, []);


  return (
    <>
      <div 
        ref={loadingScreenRef}
        className="absolute inset-0 z-20 bg-background flex items-center justify-center transition-opacity duration-500"
      >
        <div className="w-4/5 md:w-1/3 bg-gray-200 rounded-full h-2.5">
          <div 
            ref={progressBarRef}
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: '0%', transition: 'width 0.3s ease-in-out' }}
          ></div>
        </div>
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000"
        muted
        loop
        playsInline
        preload="auto"
      ></video>
      <div className="absolute inset-0 bg-black/50 z-10" />
    </>
  );
}
