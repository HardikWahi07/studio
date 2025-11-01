import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 p-1 dark:bg-slate-700">
        <img 
          src="/logo.png" 
          alt="TripMind Logo" 
          width="32" 
          height="32"
        />
      </div>
      <span className="font-headline text-2xl font-bold">
        TripMind
      </span>
    </div>
  );
}
