import { useEffect, useRef, useState } from 'react';
import { Pad } from '../state/samplerTypes';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface WaveformProps {
  pad: Pad;
  onSliceChange: (start: number, end: number) => void;
}

export function Waveform({ pad, onSliceChange }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);

  useEffect(() => {
    if (!pad.buffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, width, height);

    // Get audio data
    const audioData = pad.buffer.getChannelData(0);
    const totalSamples = audioData.length;
    
    // Calculate visible range based on zoom and pan
    const visibleStart = Math.max(0, pan);
    const visibleEnd = Math.min(1, pan + (1 / zoom));
    const visibleSamples = Math.floor(totalSamples * (visibleEnd - visibleStart));
    const startSample = Math.floor(totalSamples * visibleStart);
    
    // Draw waveform
    ctx.strokeStyle = 'hsl(var(--muted-foreground))';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const samplesPerPixel = Math.max(1, Math.floor(visibleSamples / width));
    
    for (let x = 0; x < width; x++) {
      const sampleIndex = startSample + x * samplesPerPixel;
      if (sampleIndex >= totalSamples) break;

      let min = 0;
      let max = 0;

      // Sample multiple points for better representation
      for (let i = 0; i < samplesPerPixel && sampleIndex + i < totalSamples; i++) {
        const sample = audioData[sampleIndex + i];
        min = Math.min(min, sample);
        max = Math.max(max, sample);
      }

      const yMin = (height / 2) + (min * height / 2 * 0.8);
      const yMax = (height / 2) + (max * height / 2 * 0.8);

      if (x === 0) {
        ctx.moveTo(x, yMin);
      } else {
        ctx.lineTo(x, yMin);
      }
      ctx.lineTo(x, yMax);
    }

    ctx.stroke();

    // Draw slice markers
    const sliceStartX = ((pad.sliceStart - visibleStart) * zoom) * width;
    const sliceEndX = ((pad.sliceEnd - visibleStart) * zoom) * width;

    // Slice region
    if (sliceStartX >= 0 && sliceStartX <= width && sliceEndX >= 0 && sliceEndX <= width) {
      ctx.fillStyle = 'hsla(var(--roma-gold), 0.2)';
      ctx.fillRect(sliceStartX, 0, sliceEndX - sliceStartX, height);
    }

    // Slice handles
    ctx.strokeStyle = 'hsl(var(--roma-gold))';
    ctx.lineWidth = 2;

    if (sliceStartX >= -5 && sliceStartX <= width + 5) {
      ctx.beginPath();
      ctx.moveTo(sliceStartX, 0);
      ctx.lineTo(sliceStartX, height);
      ctx.stroke();

      // Start handle
      ctx.fillStyle = 'hsl(var(--roma-gold))';
      ctx.fillRect(sliceStartX - 4, 0, 8, 12);
    }

    if (sliceEndX >= -5 && sliceEndX <= width + 5) {
      ctx.beginPath();
      ctx.moveTo(sliceEndX, 0);
      ctx.lineTo(sliceEndX, height);
      ctx.stroke();

      // End handle
      ctx.fillStyle = 'hsl(var(--roma-gold))';
      ctx.fillRect(sliceEndX - 4, height - 12, 8, 12);
    }
  }, [pad.buffer, pad.sliceStart, pad.sliceEnd, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pad.buffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvas.width;

    const visibleStart = Math.max(0, pan);
    const visibleEnd = Math.min(1, pan + (1 / zoom));

    const sliceStartX = ((pad.sliceStart - visibleStart) * zoom) * width;
    const sliceEndX = ((pad.sliceEnd - visibleStart) * zoom) * width;

    // Check if clicking near handles
    if (Math.abs(x - sliceStartX) < 10) {
      setIsDragging('start');
    } else if (Math.abs(x - sliceEndX) < 10) {
      setIsDragging('end');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !pad.buffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvas.width;

    const visibleStart = Math.max(0, pan);
    const normalizedX = (x / width) / zoom + visibleStart;
    const clampedX = Math.max(0, Math.min(1, normalizedX));

    if (isDragging === 'start') {
      onSliceChange(clampedX, Math.max(clampedX + 0.01, pad.sliceEnd));
    } else if (isDragging === 'end') {
      onSliceChange(Math.min(clampedX - 0.01, pad.sliceStart), clampedX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom * 1.5, 10) : Math.max(zoom / 1.5, 1);
    setZoom(newZoom);
    
    // Adjust pan to keep centered
    if (newZoom === 1) {
      setPan(0);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPan(0);
  };

  if (!pad.buffer) {
    return (
      <div className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground">
        Load an audio file to view waveform
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground flex items-center">
          Zoom: {zoom.toFixed(1)}x
        </span>
      </div>
      
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full h-30 border border-border rounded cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Start: {(pad.sliceStart * 100).toFixed(1)}% | End: {(pad.sliceEnd * 100).toFixed(1)}%</div>
        <div>Duration: {((pad.sliceEnd - pad.sliceStart) * pad.buffer.duration).toFixed(2)}s</div>
      </div>
    </div>
  );
}