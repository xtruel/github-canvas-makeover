import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePlayer } from '../state/playerContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AlbumArt } from './AlbumArt';
import { PlayerControls } from './PlayerControls';
import { EqualizerBars } from './EqualizerBars';

interface MiniPlayerPreviewProps {
  className?: string;
}

export function MiniPlayerPreview({ className }: MiniPlayerPreviewProps) {
  const { state } = usePlayer();
  const { currentTrack, isPlaying } = useAudioPlayer();

  if (!currentTrack) {
    // Show a preview with placeholder content to showcase the music feature
    return (
      <div className={cn('music-mini-player p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-roma-red to-roma-gold flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <EqualizerBars 
              size="sm" 
              isPlaying={false} 
              className="absolute -bottom-1 -right-1" 
              barCount={3}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-roma-gold">
              Music Player
            </h4>
            <p className="text-xs text-muted-foreground">
              Discover Roma anthems
            </p>
          </div>
          
          <Link 
            to="/albums" 
            className="text-xs text-roma-gold hover:text-roma-yellow transition-colors"
          >
            Explore →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('music-mini-player p-4', className)}>
      <div className="flex items-center gap-3">
        {/* Album Art */}
        <div className="relative">
          <AlbumArt
            src={currentTrack.coverUrl}
            alt={`${currentTrack.album} cover`}
            size="sm"
            isPlaying={isPlaying}
            className="music-mini-album"
          />
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-roma-gold truncate">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artist}
          </p>
        </div>
        
        {/* Mini Controls */}
        <PlayerControls variant="mini" />
        
        {/* Link to full player */}
        <Link 
          to="/player" 
          className="text-xs text-roma-gold hover:text-roma-yellow transition-colors ml-2"
        >
          Open →
        </Link>
      </div>
      
      {/* Progress bar (optional, can be hidden in mini version) */}
      {isPlaying && (
        <div className="mt-2">
          <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-roma-red to-roma-gold transition-all duration-300"
              style={{ 
                width: `${state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}