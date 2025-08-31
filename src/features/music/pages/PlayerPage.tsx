import { Shuffle, Repeat, Heart, MoreHorizontal, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlayer } from '../state/playerContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AlbumArt } from '../components/AlbumArt';
import { PlayerControls } from '../components/PlayerControls';
import { TrackListItem } from '../components/TrackListItem';
import { mockTracks } from '../data/mockData';
import '../music.css';

const PlayerPage = () => {
  const { state, playTrack } = usePlayer();
  const { currentTrack, isPlaying, togglePlay } = useAudioPlayer();

  const handleTrackPlay = (track: typeof mockTracks[0]) => {
    playTrack(track, mockTracks);
  };

  if (!currentTrack) {
    // Show welcome state when no track is playing
    return (
      <div className="min-h-screen music-page-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="music-album-card bg-gradient-to-br from-roma-red/10 to-roma-gold/10">
              <CardContent className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-roma-red to-roma-gold flex items-center justify-center">
                  <div className="text-white text-4xl">♪</div>
                </div>
                <h1 className="text-3xl font-bold text-roma-gold mb-4">
                  Welcome to Roma Music Player
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Select a track from our collection to start your musical journey through Roma's greatest anthems.
                </p>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-roma-gold">Available Tracks</h3>
                  <div className="space-y-2">
                    {mockTracks.slice(0, 3).map((track) => (
                      <Button
                        key={track.id}
                        variant="outline"
                        onClick={() => handleTrackPlay(track)}
                        className="music-control-button w-full"
                      >
                        Play "{track.title}" by {track.artist}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen music-page-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Player */}
            <div className="space-y-6">
              <Card className="music-album-card">
                <CardContent className="p-8">
                  {/* Album Art */}
                  <div className="mb-6">
                    <AlbumArt
                      src={currentTrack.coverUrl}
                      alt={`${currentTrack.album} cover`}
                      size="xl"
                      isPlaying={isPlaying}
                      className="mx-auto"
                    />
                  </div>

                  {/* Track Info */}
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-roma-gold mb-2">
                      {currentTrack.title}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-1">
                      {currentTrack.artist}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentTrack.album}
                    </p>
                  </div>

                  {/* Player Controls */}
                  <PlayerControls className="mb-6" />

                  {/* Additional Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="music-control-button rounded-full"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="music-control-button rounded-full"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Queue / Playlist */}
            <div className="space-y-6">
              <Card className="music-album-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <List className="h-5 w-5 text-roma-gold" />
                    <h2 className="text-lg font-semibold text-roma-gold">
                      Current Queue
                    </h2>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {state.queue.map((track, index) => (
                      <TrackListItem
                        key={track.id}
                        track={track}
                        isPlaying={isPlaying && track.id === currentTrack?.id}
                        isActive={track.id === currentTrack?.id}
                        onPlay={() => handleTrackPlay(track)}
                        onPause={togglePlay}
                        showAlbumArt={false}
                        showIndex={true}
                        index={index}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Up Next */}
              <Card className="music-album-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-roma-gold mb-4">
                    Suggested Tracks
                  </h3>
                  <div className="space-y-2">
                    {mockTracks
                      .filter(track => !state.queue.some(q => q.id === track.id))
                      .slice(0, 3)
                      .map((track) => (
                        <TrackListItem
                          key={track.id}
                          track={track}
                          isPlaying={false}
                          isActive={false}
                          onPlay={() => handleTrackPlay(track)}
                          onPause={togglePlay}
                          showAlbumArt={false}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;