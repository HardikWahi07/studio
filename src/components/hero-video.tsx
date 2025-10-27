
'use client';

import React, { useEffect, useRef } from 'react';

const API_KEY = "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";
const query = "green valley river drone 4k";

export function HeroVideo({ onVideoLoad }: { onVideoLoad?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    const handleVideoLoaded = () => {
      if (onVideoLoad) {
        onVideoLoad();
      }
      // Ensure video is visible after loading
      if (videoRef.current) {
        videoRef.current.classList.add('opacity-100');
        videoRef.current.play().catch(e => console.log("Autoplay is waiting for user interaction."));
      }
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
    
    async function loadRandomVideoFast() {
      try {
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

    videoEl.addEventListener('loadeddata', handleVideoLoaded);
    loadRandomVideoFast();

    return () => {
        if (videoEl) {
            videoEl.removeEventListener('loadeddata', handleVideoLoaded);
        }
    }
  }, [onVideoLoad]);


  return (
    <>
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
