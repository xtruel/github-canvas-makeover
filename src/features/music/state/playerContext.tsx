import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  coverUrl: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  isLoading: boolean;
  isMuted: boolean;
  playbackSpeed: number;
}

export type PlayerAction =
  | { type: 'SET_TRACK'; payload: Track }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number };

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,
  isLoading: false,
  isMuted: false,
  playbackSpeed: 1.0,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        currentTime: 0,
      };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'NEXT_TRACK':
      if (state.currentIndex < state.queue.length - 1) {
        const nextIndex = state.currentIndex + 1;
        return {
          ...state,
          currentIndex: nextIndex,
          currentTrack: state.queue[nextIndex],
          currentTime: 0,
        };
      }
      return state;
    case 'PREVIOUS_TRACK':
      if (state.currentIndex > 0) {
        const prevIndex = state.currentIndex - 1;
        return {
          ...state,
          currentIndex: prevIndex,
          currentTrack: state.queue[prevIndex],
          currentTime: 0,
        };
      }
      return state;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_PLAYBACK_SPEED':
      return { ...state, playbackSpeed: action.payload };
    default:
      return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  const playTrack = (track: Track, queue?: Track[]) => {
    if (queue) {
      dispatch({ type: 'SET_QUEUE', payload: queue });
      const index = queue.findIndex(t => t.id === track.id);
      dispatch({ type: 'SET_TRACK', payload: track });
      if (index >= 0) {
        // Update current index in the queue
        const newState = { ...state, currentIndex: index, queue };
      }
    } else {
      dispatch({ type: 'SET_TRACK', payload: track });
    }
    dispatch({ type: 'PLAY' });
  };

  const playQueue = (tracks: Track[], startIndex = 0) => {
    dispatch({ type: 'SET_QUEUE', payload: tracks });
    if (tracks[startIndex]) {
      dispatch({ type: 'SET_TRACK', payload: tracks[startIndex] });
      // Set current index
      const newState = { ...state, currentIndex: startIndex };
      dispatch({ type: 'PLAY' });
    }
  };

  const contextValue: PlayerContextType = {
    state,
    dispatch,
    playTrack,
    playQueue,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}