import { Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePlayer } from '../state/playerContext';
import { AlbumArt } from '../components/AlbumArt';
import { mockAlbums, getTracksByAlbum } from '../data/mockData';
import '../music.css';

const AlbumsPage = () => {
  const { playQueue } = usePlayer();

  const handlePlayAlbum = (albumId: string) => {
    const tracks = getTracksByAlbum(albumId);
    if (tracks.length > 0) {
      playQueue(tracks, 0);
    }
  };

  return (
    <div className="min-h-screen music-page-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-roma-red to-roma-gold flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Albums</h1>
              <p className="text-muted-foreground">Discover Roma music collection</p>
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        <div className="music-albums-grid">
          {mockAlbums.map((album) => {
            const tracks = getTracksByAlbum(album.id);
            
            return (
              <Card key={album.id} className="music-album-card">
                <CardHeader className="p-0">
                  <div className="relative group">
                    <AlbumArt
                      src={album.coverUrl}
                      alt={`${album.title} cover`}
                      size="lg"
                      className="w-full aspect-square"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={() => handlePlayAlbum(album.id)}
                        className="music-control-button rounded-full w-16 h-16"
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-roma-gold truncate">
                    {album.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2 truncate">
                    {album.artist}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{album.year}</span>
                    <span>{album.trackCount} tracks</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAlbum(album.id)}
                    className="w-full mt-3 music-control-button"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Album
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-roma-gold">Featured Collection</h2>
          <Card className="music-album-card bg-gradient-to-r from-roma-red/10 to-roma-gold/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <AlbumArt
                  src="/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png"
                  alt="Roma Collection"
                  size="lg"
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-roma-gold mb-2">
                    Complete Roma Collection
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    All the classic songs celebrating AS Roma, from historic anthems to modern chants. 
                    Experience the passion and pride of being Giallorossi.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => handlePlayAlbum('1')}
                    className="music-control-button"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Play Collection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlbumsPage;