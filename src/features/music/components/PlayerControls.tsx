import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  variant?: 'full' | 'mini';
  className?: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function PlayerControls({ variant = 'full', className }: PlayerControlsProps) {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    toggleMute,
  } = useAudioPlayer();

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  if (variant === 'mini') {
    return (
      <div className={cn('music-mini-controls flex items-center', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={previousTrack}
          className="music-mini-control-btn"
          disabled={!currentTrack}
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="music-mini-control-btn"
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextTrack}
          className="music-mini-control-btn"
          disabled={!currentTrack}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      {currentTrack && (
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!currentTrack}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="music-control-button rounded-full"
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={previousTrack}
          className="music-control-button rounded-full"
          disabled={!currentTrack}
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={togglePlay}
          className="music-control-button rounded-full w-12 h-12"
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextTrack}
          className="music-control-button rounded-full"
          disabled={!currentTrack}
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="music-control-button rounded-full"
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 max-w-xs mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="music-control-button rounded-full p-2"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}