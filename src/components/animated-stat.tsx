
'use client';

import { useEffect, useState } from 'react';

interface AnimatedStatProps {
  finalValue: number;
  label?: string;
  duration?: number;
}

export function AnimatedStat({
  finalValue,
  label,
  duration = 2000,
}: AnimatedStatProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * finalValue));
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        setCount(finalValue);
      }
    };
    requestAnimationFrame(step);
  }, [finalValue, duration]);

  if (label) {
    if (count < finalValue) {
      // Show intermediate count for large numbers to feel like its counting up
      return <>{count.toLocaleString()}+</>;
    }
    return <>{label}</>;
  }

  return <>{count.toLocaleString()}</>;
}
