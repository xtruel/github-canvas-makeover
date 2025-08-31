import { Button } from '@/components/ui/button';
import { useSampler } from '../state/SamplerContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PadGridProps {
  onPadSelect?: (padId: number) => void;
}

export function PadGrid({ onPadSelect }: PadGridProps) {
  const { state, playPad, loadAudioFile, dispatch } = useSampler();
  const [dragOverPad, setDragOverPad] = useState<number | null>(null);

  const handlePadClick = (padId: number) => {
    dispatch({ type: 'SELECT_PAD', padId });
    onPadSelect?.(padId);
    
    // Play the pad if it has a buffer
    const pad = state.pads.find(p => p.id === padId);
    if (pad?.buffer) {
      playPad(padId);
    }
  };

  const handleDragOver = (e: React.DragEvent, padId: number) => {
    e.preventDefault();
    setDragOverPad(padId);
  };

  const handleDragLeave = () => {
    setDragOverPad(null);
  };

  const handleDrop = async (e: React.DragEvent, padId: number) => {
    e.preventDefault();
    setDragOverPad(null);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      await loadAudioFile(padId, audioFile);
      dispatch({ type: 'SELECT_PAD', padId });
      onPadSelect?.(padId);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {state.pads.map((pad) => {
        const isSelected = state.selectedPadId === pad.id;
        const isPlaying = state.isPlaying[pad.id];
        const isDragOver = dragOverPad === pad.id;

        return (
          <Button
            key={pad.id}
            variant="outline"
            onClick={() => handlePadClick(pad.id)}
            onDragOver={(e) => handleDragOver(e, pad.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, pad.id)}
            className={cn(
              "aspect-square h-16 border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs font-mono",
              "hover:border-roma-gold/50 hover:bg-roma-gold/10",
              isSelected && "border-roma-gold bg-roma-gold/20 text-roma-gold",
              isPlaying && "animate-pulse bg-roma-gold/30",
              isDragOver && "border-roma-yellow bg-roma-yellow/20",
              pad.isLoaded ? "border-green-500/50 bg-green-500/10" : "border-border"
            )}
          >
            <span className="font-bold">{pad.id + 1}</span>
            {pad.isLoaded && (
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {pad.fileName?.split('.')[0] || 'Sample'}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}