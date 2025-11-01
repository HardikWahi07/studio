import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold',
        className
      )}
    >
      <span className="font-headline text-2xl font-bold">
        TripMind
      </span>
    </div>
  );
}
