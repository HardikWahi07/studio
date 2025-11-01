
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 p-1.5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-primary"
          >
            <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
            <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            <path d="M12 11v.01" />
            <path d="M10 13a4 4 0 0 0-1.5 7.5" />
            <path d="M14 13a4 4 0 0 1 1.5 7.5" />
          </svg>
      </div>
      <span className="font-headline text-2xl font-bold">
        TripMind
      </span>
    </div>
  );
}
