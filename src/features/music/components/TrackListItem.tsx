import { Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Track } from '../state/playerContext';
import { AlbumArt } from './AlbumArt';
import { EqualizerBars } from './EqualizerBars';

interface TrackListItemProps {
  track: Track;
  isPlaying?: boolean;
  isActive?: boolean;
  onPlay: () => void;
  onPause: () => void;
  showAlbumArt?: boolean;
  showIndex?: boolean;
  index?: number;
  className?: string;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function TrackListItem({
  track,
  isPlaying = false,
  isActive = false,
  onPlay,
  onPause,
  showAlbumArt = true,
  showIndex = false,
  index,
  className
}: TrackListItemProps) {
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div className={cn(
      'music-track-item rounded-lg p-3 group',
      isActive && 'active',
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Index or Play Button */}
        <div className="w-8 flex justify-center">
          {showIndex && !isActive ? (
            <span className="text-sm text-muted-foreground">
              {index !== undefined ? index + 1 : ''}
            </span>
          ) : isActive && isPlaying ? (
            <EqualizerBars size="sm" isPlaying={isPlaying} barCount={3} />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Album Art */}
        {showAlbumArt && (
          <AlbumArt
            src={track.coverUrl}
            alt={`${track.album} cover`}
            size="sm"
            isPlaying={isActive && isPlaying}
            showGradient={false}
          />
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'font-medium truncate',
              isActive && 'text-roma-gold'
            )}>
              {track.title}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {track.artist}
          </p>
        </div>

        {/* Album Name (desktop only) */}
        <div className="hidden md:block min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">
            {track.album}
          </p>
        </div>

        {/* Duration */}
        <div className="text-sm text-muted-foreground">
          {formatDuration(track.duration)}
        </div>

        {/* More Options */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}