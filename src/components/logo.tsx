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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1.5 border-2 border-gray-200 dark:border-gray-700">
        <Image src="/logo.png" alt="TripMind Logo" width={32} height={32} />
      </div>
      <span className="font-headline text-2xl font-bold text-foreground">
        TripMind
      </span>
    </div>
  );
}
