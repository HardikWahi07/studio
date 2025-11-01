import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold',
        className
      )}
    >
      {/* This div provides a contrasting circular background to ensure the logo is always visible. */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 p-1 dark:bg-slate-700">
        <Image 
          src="/logo.png" 
          alt="TripMind Logo" 
          width={32} 
          height={32}
          unoptimized
          priority
        />
      </div>
      <span className="font-headline text-2xl font-bold">
        TripMind
      </span>
    </div>
  );
}
