import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary dark:text-white',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1.5 border border-border">
        <Image src="/logo.png" alt="TripMind Logo" width={24} height={24} />
      </div>
      <span className="font-headline text-2xl font-bold text-current">
        TripMind
      </span>
    </div>
  );
}
