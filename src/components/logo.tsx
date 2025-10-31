import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary dark:text-white',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1.5 border-2 border-gray-200 dark:border-gray-700">
        <svg
          className="w-full h-full text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22c-5 0-9-4.5-9-10 0-5.5 4-10 9-10s9 4.5 9 10c0 5.5-4 10-9 10z" />
          <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9v0z" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
          <path d="M12 2c3.5 0 6.5 2 8 5" />
          <path d="M12 22c-3.5 0-6.5-2-8-5" />
        </svg>
      </div>
      <span className="font-headline text-2xl font-bold text-current">
        TripMind
      </span>
    </div>
  );
}
