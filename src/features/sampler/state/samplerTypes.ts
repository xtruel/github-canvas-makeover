export interface EffectSettings {
  gain: number;
  drive: number;
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass';
    cutoff: number;
    resonance: number;
  };
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  delay: {
    time: number;
    feedback: number;
    mix: number;
  };
  envelope: {
    attack: number;
    release: number;
  };
}

export interface Pad {
  id: number;
  buffer: AudioBuffer | null;
  sliceStart: number; // 0 to 1
  sliceEnd: number; // 0 to 1
  effects: EffectSettings;
  isLoaded: boolean;
  fileName?: string;
}

export interface SamplerState {
  pads: Pad[];
  selectedPadId: number | null;
  masterGain: number;
  audioContext: AudioContext | null;
  isPlaying: Record<number, boolean>;
}

export type SamplerAction =
  | { type: 'INIT_AUDIO_CONTEXT'; audioContext: AudioContext }
  | { type: 'SET_BUFFER'; padId: number; buffer: AudioBuffer; fileName?: string }
  | { type: 'SET_SLICE'; padId: number; start: number; end: number }
  | { type: 'SET_EFFECT'; padId: number; effectType: keyof EffectSettings; value: any }
  | { type: 'SET_MASTER_GAIN'; gain: number }
  | { type: 'SELECT_PAD'; padId: number | null }
  | { type: 'SET_PLAYING'; padId: number; isPlaying: boolean };

const createDefaultEffects = (): EffectSettings => ({
  gain: 0.8,
  drive: 0,
  filter: {
    type: 'lowpass',
    cutoff: 22000,
    resonance: 1,
  },
  eq: {
    low: 0,
    mid: 0,
    high: 0,
  },
  delay: {
    time: 0.2,
    feedback: 0.2,
    mix: 0,
  },
  envelope: {
    attack: 0.01,
    release: 0.1,
  },
});

const createInitialPads = (): Pad[] => {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    buffer: null,
    sliceStart: 0,
    sliceEnd: 1,
    effects: createDefaultEffects(),
    isLoaded: false,
  }));
};

export const initialSamplerState: SamplerState = {
  pads: createInitialPads(),
  selectedPadId: null,
  masterGain: 0.8,
  audioContext: null,
  isPlaying: {},
};

export function samplerReducer(state: SamplerState, action: SamplerAction): SamplerState {
  switch (action.type) {
    case 'INIT_AUDIO_CONTEXT':
      return {
        ...state,
        audioContext: action.audioContext,
      };

    case 'SET_BUFFER':
      return {
        ...state,
        pads: state.pads.map(pad =>
          pad.id === action.padId
            ? {
                ...pad,
                buffer: action.buffer,
                fileName: action.fileName,
                isLoaded: true,
                sliceStart: 0,
                sliceEnd: 1,
              }
            : pad
        ),
      };

    case 'SET_SLICE':
      return {
        ...state,
        pads: state.pads.map(pad =>
          pad.id === action.padId
            ? {
                ...pad,
                sliceStart: Math.max(0, Math.min(1, action.start)),
                sliceEnd: Math.max(0, Math.min(1, action.end)),
              }
            : pad
        ),
      };

    case 'SET_EFFECT':
      return {
        ...state,
        pads: state.pads.map(pad =>
          pad.id === action.padId
            ? {
                ...pad,
                effects: {
                  ...pad.effects,
                  [action.effectType]: action.value,
                },
              }
            : pad
        ),
      };

    case 'SET_MASTER_GAIN':
      return {
        ...state,
        masterGain: action.gain,
      };

    case 'SELECT_PAD':
      return {
        ...state,
        selectedPadId: action.padId,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: {
          ...state.isPlaying,
          [action.padId]: action.isPlaying,
        },
      };

    default:
      return state;
  }
}