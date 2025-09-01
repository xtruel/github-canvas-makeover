/**
 * Dynamic Viewport Height Handling
 * 
 * Provides robust dynamic visual viewport height handling with orientation change
 * detection and on-screen keyboard suppression heuristics.
 */

// Configuration constants
const SHRINK_SUPPRESS_RATIO = 0.75; // Suppress updates when shrink below 75% baseline
const RESUME_RATIO = 0.85; // Resume updates when height recovers to >=85% baseline  
const ORIENTATION_DELTA_RATIO = 0.20; // Treat as orientation change if delta > 20% baseline
const AUTO_CLEAR_SUPPRESSION_MS = 3000; // Auto-clear suppression after 3s without focused editable

// Internal state
interface ViewportState {
  initialHeight: number; // Baseline height captured at init/rebaseline
  lastAppliedHeight: number; // Last height value applied to CSS vars
  lastOrientation: 'portrait' | 'landscape'; // Last detected orientation
  suppressionActive: boolean; // Whether shrink updates are being suppressed
  suppressionStartTimestamp: number; // When suppression started (for auto-clear)
  debounceFrame: number | null; // requestAnimationFrame ID for debouncing
  isInitialized: boolean; // Whether the controller has been initialized
}

let state: ViewportState = {
  initialHeight: 0,
  lastAppliedHeight: 0,
  lastOrientation: 'portrait',
  suppressionActive: false,
  suppressionStartTimestamp: 0,
  debounceFrame: null,
  isInitialized: false
};

// Debug mode detection
const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('vhdebug') && 
         (typeof process === 'undefined' || process.env.NODE_ENV !== 'production');
};

// Debug logging utility
const debugLog = (message: string, ...args: any[]) => {
  if (isDebugMode()) {
    console.log(`[vh] ${message}`, ...args);
  }
};

// Get current viewport height with fallback
const getCurrentViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Use visualViewport if available, otherwise fallback to window.innerHeight
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  return window.innerHeight;
};

// Detect current orientation
const detectOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'portrait';
  
  // Try matchMedia first
  if (window.matchMedia) {
    const portraitMatch = window.matchMedia('(orientation: portrait)');
    if (portraitMatch.matches) return 'portrait';
    
    const landscapeMatch = window.matchMedia('(orientation: landscape)');
    if (landscapeMatch.matches) return 'landscape';
  }
  
  // Fallback to width/height comparison
  const width = window.innerWidth;
  const height = getCurrentViewportHeight();
  return height > width ? 'portrait' : 'landscape';
};

// Check if an editable element is currently focused
const isEditableFocused = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  // Check for input/textarea elements
  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  
  // Check for contenteditable
  if (activeElement.getAttribute('contenteditable') === 'true') return true;
  
  return false;
};

// Apply height values to CSS custom properties
const applyHeightToCSSVars = (height: number) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const vh = height * 0.01; // 1% of viewport height
  
  root.style.setProperty('--app-vh', `${vh}px`);
  root.style.setProperty('--app-height', `${height}px`);
  
  state.lastAppliedHeight = height;
  debugLog('applyHeight', { height, vh: `${vh}px` });
};

// Set baseline height and initial CSS vars
const setBaseline = (height: number, reason = 'init') => {
  if (typeof document === 'undefined') return;
  
  state.initialHeight = height;
  const initialVh = height * 0.01;
  
  const root = document.documentElement;
  root.style.setProperty('--app-vh-initial', `${initialVh}px`);
  
  applyHeightToCSSVars(height);
  debugLog('rebaseline', { reason, height, initialVh: `${initialVh}px` });
};

// Handle viewport recalculation with all the heuristics
const handleRecalculation = (reason = 'resize') => {
  const currentHeight = getCurrentViewportHeight();
  const currentOrientation = detectOrientation();
  const editableFocused = isEditableFocused();
  
  // Check for orientation change
  const orientationChanged = currentOrientation !== state.lastOrientation;
  if (orientationChanged) {
    state.lastOrientation = currentOrientation;
    setBaseline(currentHeight, `orientation-${currentOrientation}`);
    // Clear any active suppression on orientation change
    if (state.suppressionActive) {
      state.suppressionActive = false;
      debugLog('suppress end', { reason: 'orientation-change' });
    }
    return;
  }
  
  // Check for large delta that might indicate orientation change without orientation event
  const deltaRatio = Math.abs(currentHeight - state.lastAppliedHeight) / state.initialHeight;
  if (deltaRatio > ORIENTATION_DELTA_RATIO && !editableFocused) {
    setBaseline(currentHeight, 'large-delta');
    if (state.suppressionActive) {
      state.suppressionActive = false;
      debugLog('suppress end', { reason: 'large-delta' });
    }
    return;
  }
  
  // Auto-clear suppression if no editable focused for too long
  if (state.suppressionActive && !editableFocused) {
    const suppressionDuration = Date.now() - state.suppressionStartTimestamp;
    if (suppressionDuration > AUTO_CLEAR_SUPPRESSION_MS) {
      state.suppressionActive = false;
      debugLog('suppress end', { reason: 'auto-clear', duration: suppressionDuration });
    }
  }
  
  // Check if we should suppress shrink updates
  if (editableFocused && !state.suppressionActive) {
    const shrinkRatio = currentHeight / state.initialHeight;
    if (shrinkRatio < SHRINK_SUPPRESS_RATIO) {
      state.suppressionActive = true;
      state.suppressionStartTimestamp = Date.now();
      debugLog('suppress start', { shrinkRatio, currentHeight, initialHeight: state.initialHeight });
      return; // Don't update height
    }
  }
  
  // Check if we should resume from suppression
  if (state.suppressionActive) {
    const resumeRatio = currentHeight / state.initialHeight;
    if (resumeRatio >= RESUME_RATIO || !editableFocused) {
      state.suppressionActive = false;
      debugLog('suppress end', { reason: 'resume', resumeRatio, editableFocused });
    } else {
      // Still suppressing
      return;
    }
  }
  
  // Apply the height update
  applyHeightToCSSVars(currentHeight);
};

// Debounced recalculation using requestAnimationFrame
const scheduleRecalculation = (reason = 'resize') => {
  if (state.debounceFrame) {
    cancelAnimationFrame(state.debounceFrame);
  }
  
  state.debounceFrame = requestAnimationFrame(() => {
    state.debounceFrame = null;
    handleRecalculation(reason);
  });
};

// Event handlers
const handleVisualViewportResize = () => scheduleRecalculation('visualViewport-resize');
const handleVisualViewportScroll = () => scheduleRecalculation('visualViewport-scroll');
const handleWindowResize = () => scheduleRecalculation('window-resize');
const handleOrientationChange = () => scheduleRecalculation('orientation-change');
const handleFocusIn = () => scheduleRecalculation('focus-in');
const handleFocusOut = () => scheduleRecalculation('focus-out');

// Viewport controller interface
export interface ViewportController {
  forceRecalc: (reason?: string) => void;
  forceRebaseline: (reason?: string) => void;
  dispose: () => void;
}

// Create the controller instance
const createController = (): ViewportController => {
  return {
    forceRecalc: (reason = 'manual') => {
      debugLog('forceRecalc', { reason });
      handleRecalculation(reason);
    },
    
    forceRebaseline: (reason = 'manual') => {
      debugLog('forceRebaseline', { reason });
      const currentHeight = getCurrentViewportHeight();
      setBaseline(currentHeight, reason);
      // Clear suppression on manual rebaseline
      if (state.suppressionActive) {
        state.suppressionActive = false;
        debugLog('suppress end', { reason: 'force-rebaseline' });
      }
    },
    
    dispose: () => {
      debugLog('dispose');
      
      // Remove event listeners
      if (typeof window !== 'undefined') {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
          window.visualViewport.removeEventListener('scroll', handleVisualViewportScroll);
        }
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
      
      if (typeof document !== 'undefined') {
        document.removeEventListener('focusin', handleFocusIn, true);
        document.removeEventListener('focusout', handleFocusOut, true);
      }
      
      // Cancel any pending animation frame
      if (state.debounceFrame) {
        cancelAnimationFrame(state.debounceFrame);
        state.debounceFrame = null;
      }
      
      // Reset state
      state.isInitialized = false;
    }
  };
};

// Main initialization function
export const initViewportHeight = (): ViewportController => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return no-op controller
    return {
      forceRecalc: () => {},
      forceRebaseline: () => {},
      dispose: () => {}
    };
  }
  
  // HMR-safe: check for existing controller
  const globalKey = '__APP_VH_CTRL';
  if ((window as any)[globalKey] && state.isInitialized) {
    debugLog('init', 'reusing existing controller');
    return (window as any)[globalKey];
  }
  
  // Clean up any existing controller
  if ((window as any)[globalKey]) {
    (window as any)[globalKey].dispose();
  }
  
  debugLog('init', 'creating new controller');
  
  // Initialize state
  const currentHeight = getCurrentViewportHeight();
  state.lastOrientation = detectOrientation();
  setBaseline(currentHeight, 'init');
  state.isInitialized = true;
  
  // Set up event listeners
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    window.visualViewport.addEventListener('scroll', handleVisualViewportScroll);
  }
  
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Use capture phase for focus events to catch them on all elements
  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('focusout', handleFocusOut, true);
  
  // Create controller
  const controller = createController();
  
  // Store globally for HMR safety
  (window as any)[globalKey] = controller;
  
  // HMR disposal
  if (typeof module !== 'undefined' && (module as any).hot) {
    (module as any).hot.dispose(() => {
      debugLog('HMR dispose');
      controller.dispose();
    });
  }
  
  return controller;
};

// Export the controller for manual access
export const viewportController = typeof window !== 'undefined' ? 
  () => (window as any).__APP_VH_CTRL as ViewportController | undefined :
  () => undefined;

// For convenience, also make it available on window for easier access from console
if (typeof window !== 'undefined') {
  (window as any).viewportController = () => (window as any).__APP_VH_CTRL;
}