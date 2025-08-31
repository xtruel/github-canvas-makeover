import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EqualizerBarsProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { width: 'w-0.5', maxHeight: 'h-4', gap: 'gap-0.5' },
  md: { width: 'w-1', maxHeight: 'h-8', gap: 'gap-1' },
  lg: { width: 'w-1.5', maxHeight: 'h-12', gap: 'gap-1.5' },
};

export function EqualizerBars({ 
  isPlaying = false, 
  barCount = 5, 
  className,
  size = 'md' 
}: EqualizerBarsProps) {
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const config = sizeConfig[size];

  useEffect(() => {
    // Initialize with random heights
    setBarHeights(Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2));
    
    if (!isPlaying) return;

    // Animate bars when playing
    const interval = setInterval(() => {
      setBarHeights(prev => 
        prev.map(() => Math.random() * 0.8 + 0.2)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  return (
    <div className={cn(
      'flex items-end justify-center',
      config.gap,
      className
    )}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'music-equalizer-bar',
            config.width,
            config.maxHeight,
            !isPlaying && 'opacity-50'
          )}
          style={{
            height: isPlaying 
              ? `${barHeights[index] * 100}%` 
              : '20%',
            animationDelay: `${index * 0.1}s`,
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
        />
      ))}
    </div>
  );
}