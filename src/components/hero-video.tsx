
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LoadingScreen } from './ui/loading-screen';
import { usePathname } from 'next/navigation';

const API_KEY = "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";
const query = "green valley river drone 4k";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const [isLoading, setIsLoading] = useState(isHomePage);

  useEffect(() => {
    if (!isHomePage) {
        setIsLoading(false);
        return;
    }

    const videoEl = videoRef.current;
    const progressEl = progressRef.current;
    if (!videoEl || !progressEl) return;

    let progressInterval: NodeJS.Timeout;
    
    const updateProgress = () => {
      progressEl.style.width = `${Math.min(95, parseFloat(progressEl.style.width || '0') + Math.random() * 5)}%`;
    }

    const startProgress = () => {
        progressEl.style.width = '0%';
        progressInterval = setInterval(updateProgress, 200);
    }
    
    const completeProgress = () => {
        clearInterval(progressInterval);
        if (progressEl) {
            progressEl.style.width = '100%';
        }
        setTimeout(() => {
            setIsLoading(false);
            if (videoEl) {
                videoEl.classList.add('opacity-100');
            }
        }, 500);
    }

    const loadFastFallback = () => {
      const fallbacks = [
        "https://cdn.coverr.co/videos/coverr-river-valley-8879/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-aerial-view-of-forest-and-river-1568/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-green-forest-from-above-5508/1080p.mp4"
      ];
      if (videoEl) {
        videoEl.src = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    };

    const loadRandomVideoFast = async () => {
      try {
        startProgress();
        const res = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&page=${Math.floor(Math.random() * 10) + 1}`,
          { headers: { Authorization: API_KEY } }
        );

        if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
        
        const data = await res.json();
    
        if (data.videos?.length > 0) {
          const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
          const files = randomVideo.video_files;
          const bestFile = files.find(v => v.quality === 'hd') || files[0];
    
          if (videoEl) {
            videoEl.src = bestFile.link;
          }
        } else {
          throw new Error("No videos found");
        }
      } catch (err) {
        console.error("Video load error:", err);
        loadFastFallback();
      }
    }

    const handleVideoLoaded = () => {
        completeProgress();
        videoEl.play().catch(e => console.log("Autoplay is waiting for user interaction."));
    };

    videoEl.addEventListener('loadeddata', handleVideoLoaded);
    loadRandomVideoFast();

    const handleDocumentClick = () => {
        if(videoEl && videoEl.paused) {
            videoEl.play().catch(e => console.log("Playback still blocked"));
        }
    }
    document.addEventListener('click', handleDocumentClick);


    return () => {
        clearInterval(progressInterval);
        if (videoEl) {
            videoEl.removeEventListener('loadeddata', handleVideoLoaded);
        }
        document.removeEventListener('click', handleDocumentClick);
    }
  }, [isHomePage]);


  return (
    <>
      {isLoading && isHomePage && <LoadingScreen ref={progressRef} />}
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
