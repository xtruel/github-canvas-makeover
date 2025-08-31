import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '../state/playerContext';

export function useAudioPlayer() {
  const { state, dispatch } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    // Set up event listeners
    const handleLoadStart = () => dispatch({ type: 'SET_LOADING', payload: true });
    const handleCanPlay = () => dispatch({ type: 'SET_LOADING', payload: false });
    const handleLoadedMetadata = () => {
      if (audio.duration) {
        dispatch({ type: 'SET_DURATION', payload: audio.duration });
      }
    };
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    };

    const handleEnded = () => {
      dispatch({ type: 'PAUSE' });
      dispatch({ type: 'NEXT_TRACK' });
    };

    const handleError = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'PAUSE' });
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [dispatch]);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      const audio = audioRef.current;
      audio.src = state.currentTrack.url;
      audio.load();
    }
  }, [state.currentTrack]);

  // Update playing state
  useEffect(() => {
    if (audioRef.current && state.currentTrack) {
      const audio = audioRef.current;
      if (state.isPlaying && audio.paused) {
        audio.play().catch((error) => {
          console.error('Failed to play audio:', error);
          dispatch({ type: 'PAUSE' });
        });
      } else if (!state.isPlaying && !audio.paused) {
        audio.pause();
      }
    }
  }, [state.isPlaying, state.currentTrack, dispatch]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = state.playbackSpeed;
    }
  }, [state.playbackSpeed]);

  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current && state.currentTrack) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_TIME', payload: time });
    }
  }, [state.currentTrack, dispatch]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [dispatch]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, volume)) });
  }, [dispatch]);

  // Next track
  const nextTrack = useCallback(() => {
    dispatch({ type: 'NEXT_TRACK' });
  }, [dispatch]);

  // Previous track
  const previousTrack = useCallback(() => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  }, [dispatch]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [dispatch]);

  // Set playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  }, [dispatch]);

  return {
    // State
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    currentTrack: state.currentTrack,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    isMuted: state.isMuted,
    playbackSpeed: state.playbackSpeed,
    queue: state.queue,
    currentIndex: state.currentIndex,
    
    // Actions
    togglePlay,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    toggleMute,
    setPlaybackSpeed,
  };
}