
'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingScreen } from './ui/loading-screen';
import { useTranslations } from '@/hooks/use-translations';

const API_KEY = "R1hsiiOY8ZHYJ9eIH6UaE4HFaHgaAFkdz3aUXvMpsvQA7XTdFx3wJ1uK";
const query = "green valley river drone 4k";

export function HeroVideo() {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingScreenRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const isHomePage = pathname === `/${locale}` || pathname === '/';

  useEffect(() => {
    if (!isHomePage) {
        if(loadingScreenRef.current) {
            loadingScreenRef.current.style.display = 'none';
        }
        return;
    }

    const videoEl = videoRef.current;
    const loadingScreenEl = loadingScreenRef.current;
    const progressBarEl = progressBarRef.current;
    if (!videoEl || !loadingScreenEl || !progressBarEl) return;

    let progressInterval: NodeJS.Timeout;

    const updateProgress = () => {
      if (progressBarEl) {
        const currentWidth = parseFloat(progressBarEl.style.width || '0');
        const newWidth = Math.min(95, currentWidth + Math.random() * 5);
        progressBarEl.style.width = `${newWidth}%`;
      }
    };

    const startProgress = () => {
      if (progressBarEl) {
        progressBarEl.style.width = '0%';
        progressInterval = setInterval(updateProgress, 200);
      }
    };

    const completeProgress = () => {
      clearInterval(progressInterval);
      if (progressBarEl) {
        progressBarEl.style.width = '100%';
      }
      setTimeout(() => {
        if (loadingScreenEl) {
          loadingScreenEl.classList.add('opacity-0', 'pointer-events-none');
        }
        if (videoEl) {
          videoEl.classList.add('opacity-100');
        }
      }, 500);
    };
    
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
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
          { headers: { Authorization: API_KEY } }
        );

        if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
        
        const data = await res.json();
    
        if (data.videos?.length > 0) {
          const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
          const files = randomVideo.video_files;
          
          const bestFile = files.find(v => v.quality === 'uhd') || 
                           files.find(v => v.quality === 'hd') ||
                           files.find(v => v.quality === 'sd') ||
                           files.sort((a,b) => b.width - a.width)[0];
    
          if (videoEl && bestFile) {
            videoEl.src = bestFile.link;
          } else {
             throw new Error("No suitable video file found");
          }
        } else {
          throw new Error("No videos found");
        }
      } catch (err) {
        console.error("Video load error:", err);
        loadFastFallback();
      }
    };

    const handleVideoLoaded = () => {
        completeProgress();
        videoEl.play().catch(e => console.log("Autoplay is waiting for user interaction."));
    };
    
    // Use 'canplaythrough' to ensure video is fully buffered
    videoEl.addEventListener('canplaythrough', handleVideoLoaded);
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
        // Remove the correct event listener
        videoEl.removeEventListener('canplaythrough', handleVideoLoaded);
      }
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isHomePage, pathname, locale]);


  return (
    <>
      <LoadingScreen ref={loadingScreenRef} progressBarRef={progressBarRef} />
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
      ></video>
      <div className="absolute inset-0 bg-black/50 z-10" />
    </>
  );
}
