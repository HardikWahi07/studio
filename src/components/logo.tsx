import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary',
        className
      )}
    >
      <div className="flex items-center justify-center rounded-md bg-primary p-1.5 text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </div>
      <span className="font-headline text-2xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
        TripMind
      </span>
    </div>
  );
}
