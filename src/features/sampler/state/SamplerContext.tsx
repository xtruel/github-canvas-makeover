import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { SamplerState, SamplerAction, samplerReducer, initialSamplerState, Pad } from './samplerTypes';

interface SamplerContextType {
  state: SamplerState;
  dispatch: React.Dispatch<SamplerAction>;
  playPad: (padId: number) => void;
  stopPad: (padId: number) => void;
  loadAudioFile: (padId: number, file: File) => Promise<void>;
}

const SamplerContext = createContext<SamplerContextType | undefined>(undefined);

export function SamplerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(samplerReducer, initialSamplerState);
  const playingSourcesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map());
  const masterGainNodeRef = useRef<GainNode | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    const initAudio = async () => {
      try {
        const audioContext = new AudioContext();
        const masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = state.masterGain;
        
        masterGainNodeRef.current = masterGain;
        dispatch({ type: 'INIT_AUDIO_CONTEXT', audioContext });
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();
  }, []);

  // Update master gain when state changes
  useEffect(() => {
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.value = state.masterGain;
    }
  }, [state.masterGain]);

  const loadAudioFile = useCallback(async (padId: number, file: File) => {
    if (!state.audioContext) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer);
      
      dispatch({
        type: 'SET_BUFFER',
        padId,
        buffer: audioBuffer,
        fileName: file.name,
      });
    } catch (error) {
      console.error('Failed to load audio file:', error);
    }
  }, [state.audioContext]);

  const playPad = useCallback((padId: number) => {
    if (!state.audioContext || !masterGainNodeRef.current) return;

    const pad = state.pads.find(p => p.id === padId);
    if (!pad?.buffer) return;

    // Stop any currently playing sound for this pad
    stopPad(padId);

    const source = state.audioContext.createBufferSource();
    source.buffer = pad.buffer;

    // Create gain node for this pad
    const padGain = state.audioContext.createGain();
    padGain.gain.value = pad.effects.gain;

    // Connect: source -> padGain -> masterGain -> destination
    source.connect(padGain);
    padGain.connect(masterGainNodeRef.current);

    // Calculate slice timing
    const bufferDuration = pad.buffer.duration;
    const startTime = pad.sliceStart * bufferDuration;
    const endTime = pad.sliceEnd * bufferDuration;
    const sliceDuration = endTime - startTime;

    // Apply envelope
    const attackTime = pad.effects.envelope.attack;
    const releaseTime = pad.effects.envelope.release;
    const now = state.audioContext.currentTime;

    // Attack
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(pad.effects.gain, now + attackTime);

    // Release
    const releaseStartTime = now + sliceDuration - releaseTime;
    if (releaseStartTime > now + attackTime) {
      padGain.gain.setValueAtTime(pad.effects.gain, releaseStartTime);
      padGain.gain.linearRampToValueAtTime(0, now + sliceDuration);
    }

    // Start playback
    source.start(now, startTime, sliceDuration);

    // Track the source
    playingSourcesRef.current.set(padId, source);
    dispatch({ type: 'SET_PLAYING', padId, isPlaying: true });

    // Clean up when finished
    source.onended = () => {
      playingSourcesRef.current.delete(padId);
      dispatch({ type: 'SET_PLAYING', padId, isPlaying: false });
    };
  }, [state.audioContext, state.pads, stopPad]);

  const stopPad = useCallback((padId: number) => {
    const source = playingSourcesRef.current.get(padId);
    if (source) {
      source.stop();
      source.disconnect();
      playingSourcesRef.current.delete(padId);
      dispatch({ type: 'SET_PLAYING', padId, isPlaying: false });
    }
  }, []);

  const value = {
    state,
    dispatch,
    playPad,
    stopPad,
    loadAudioFile,
  };

  return (
    <SamplerContext.Provider value={value}>
      {children}
    </SamplerContext.Provider>
  );
}

export function useSampler() {
  const context = useContext(SamplerContext);
  if (context === undefined) {
    throw new Error('useSampler must be used within a SamplerProvider');
  }
  return context;
}