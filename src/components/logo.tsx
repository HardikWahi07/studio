import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 p-1">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity:1}} />
              </linearGradient>
            </defs>
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z" fill="url(#grad1)"/>
            <path d="M12 4a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6V4Z" fill="currentColor" fillOpacity="0.2"/>
            <path d="M5.636 6.364a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 0 1-1.414 1.414L5.636 7.778a1 1 0 0 1 0-1.414Z" fill="hsl(var(--accent))"/>
            <path d="M14.121 5.636a1 1 0 0 1 0 1.414L7.757 13.414a1 1 0 0 1-1.414 0l-1.414-1.414a1 1 0 1 1 1.414-1.414l.707.707 5.657-5.657a1 1 0 0 1 1.414 0Z" fill="url(#grad1)"/>
            <path d="m14.121 16.243-2.828-2.829-1.414 1.414 2.828 2.829a1 1 0 0 0 1.414-1.414Z" fill="currentColor" fillOpacity="0.4"/>
          </svg>
      </div>
      <span className="font-headline text-2xl font-bold">
        TripMind
      </span>
    </div>
  );
}
