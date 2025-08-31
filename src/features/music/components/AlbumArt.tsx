import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AlbumArtProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  className?: string;
  showGradient?: boolean;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

export function AlbumArt({ 
  src, 
  alt, 
  size = 'md', 
  isPlaying = false, 
  className,
  showGradient = true 
}: AlbumArtProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg',
      sizeClasses[size],
      isPlaying && 'music-playing-pulse',
      className
    )}>
      {/* Gradient Overlay */}
      {showGradient && (
        <div className="absolute inset-0 music-album-gradient opacity-80" />
      )}
      
      {/* Album Image */}
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        /* Fallback when image fails to load */
        <div className="w-full h-full flex items-center justify-center music-album-gradient">
          <div className="text-white/80 text-center">
            <div className="text-lg font-bold">♪</div>
            <div className="text-xs opacity-80">No Cover</div>
          </div>
        </div>
      )}
      
      {/* Overlay for darkening when needed */}
      {showGradient && (
        <div className="absolute inset-0 music-album-overlay" />
      )}
      
      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-1">
            <div className="music-equalizer-bar w-1 h-3"></div>
            <div className="music-equalizer-bar w-1 h-4"></div>
            <div className="music-equalizer-bar w-1 h-2"></div>
          </div>
        </div>
      )}
    </div>
  );
}