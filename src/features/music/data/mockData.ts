import { Track } from '../state/playerContext';

// Mock audio URLs - in a real app these would be actual audio files
const MOCK_AUDIO_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmYdAjyO0+7IfSkELnvB6tOWTAwVZcvw5aFOGQhFpO/hqmQqAjqWtO7GhCMKKnfM7t+MPgsRa7jw256RFgBGmurvhCQJMH3C5dOXSQ0RZdHv5aJMEgJHpO/qpGEtAzqQs+3GhCQJK3bL7d+OPgoQa7jw3Z6SAgs6kNXr0aJaGABBj+jy5qxdJAtFoNPYrWMjBjiw5v/Dej8BADeX1vLCgCgHNILF59eIOAtUcOzLqW4lBTOF0+nGdyQNRbTEF];'; // This would be a real audio file URL

export const mockAlbums = [
  {
    id: '1',
    title: 'Roma Classics',
    artist: 'Various Artists',
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
    year: 2024,
    trackCount: 8,
  },
  {
    id: '2', 
    title: 'Forza Roma Anthems',
    artist: 'Curva Sud',
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
    year: 2023,
    trackCount: 12,
  },
  {
    id: '3',
    title: 'Giallorossi Pride',
    artist: 'Roma Ultras',
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
    year: 2024,
    trackCount: 10,
  },
];

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Roma Roma Roma',
    artist: 'Antonello Venditti',
    album: 'Roma Classics',
    duration: 198,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '2',
    title: 'Grazie Roma',
    artist: 'Tony Renis',
    album: 'Roma Classics', 
    duration: 235,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '3',
    title: 'Roma Nun Fa La Stupida Stasera',
    artist: 'Gabriella Ferri',
    album: 'Roma Classics',
    duration: 178,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '4',
    title: 'Quanto Sei Bella Roma',
    artist: 'Claudio Villa',
    album: 'Roma Classics',
    duration: 205,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '5',
    title: 'Forza Roma Alé',
    artist: 'Curva Sud',
    album: 'Forza Roma Anthems',
    duration: 142,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '6',
    title: 'Daje Roma Daje',
    artist: 'Curva Sud',
    album: 'Forza Roma Anthems',
    duration: 89,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '7',
    title: 'Giallorossi Nel Cuore',
    artist: 'Roma Ultras',
    album: 'Giallorossi Pride',
    duration: 167,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
  {
    id: '8',
    title: 'Sud Che Canta',
    artist: 'Roma Ultras',
    album: 'Giallorossi Pride',
    duration: 156,
    url: MOCK_AUDIO_URL,
    coverUrl: '/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png',
  },
];

export function getTracksByAlbum(albumId: string): Track[] {
  const album = mockAlbums.find(a => a.id === albumId);
  if (!album) return [];
  
  return mockTracks.filter(track => track.album === album.title);
}