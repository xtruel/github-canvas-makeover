import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface KnobProps {
  value: number; // 0 to 1
  onChange: (value: number) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const sizeConfig = {
  sm: { size: 'w-12 h-12', indicator: 'w-0.5 h-4' },
  md: { size: 'w-16 h-16', indicator: 'w-1 h-6' },
  lg: { size: 'w-20 h-20', indicator: 'w-1 h-8' },
};

export function Knob({
  value,
  onChange,
  label,
  size = 'md',
  min = 0,
  max = 1,
  step = 0.01,
  className
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const config = sizeConfig[size];
  
  // Convert value to angle (0-270 degrees, starting from 7:30 position)
  const normalizedValue = (value - min) / (max - min);
  const angle = normalizedValue * 270 - 135; // -135 to 135 degrees

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !knobRef.current) return;

    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    // Calculate angle from center
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Normalize angle to 0-270 degrees (7:30 to 4:30 position)
    angle = ((angle + 135) % 360 + 360) % 360;
    if (angle > 270) angle = 270;
    
    // Convert angle to value
    const normalizedValue = Math.max(0, Math.min(1, angle / 270));
    const newValue = min + normalizedValue * (max - min);
    
    // Apply step
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  }, [isDragging, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        ref={knobRef}
        className={cn(
          'music-knob flex items-center justify-center select-none',
          config.size,
          isDragging && 'music-control-button active'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Knob indicator */}
        <div
          className={cn(
            'music-knob-indicator absolute',
            config.indicator
          )}
          style={{
            transform: `rotate(${angle}deg) translateY(-${parseInt(config.size.split('-')[1]) / 4}px)`,
            top: '50%',
            left: '50%',
            marginLeft: `-${parseInt(config.indicator.split('-')[1]) * 2}px`,
          }}
        />
        
        {/* Center dot */}
        <div className="w-2 h-2 bg-roma-gold rounded-full" />
      </div>
      
      {label && (
        <span className="text-xs text-muted-foreground text-center">
          {label}
        </span>
      )}
    </div>
  );
}