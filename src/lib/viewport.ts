/**
 * Dynamic Viewport Height Handling
 * 
 * Provides robust viewport height management with orientation change detection
 * and keyboard suppression heuristics to prevent layout jumps on mobile devices.
 */

// Configuration constants
const SHRINK_SUPPRESS_RATIO = 0.75;
const RESUME_RATIO = 0.85;
const ORIENTATION_DELTA_RATIO = 0.20;
const SUPPRESSION_TIMEOUT = 3000; // 3 seconds

interface ViewportState {
  initialHeight: number;
  lastAppliedHeight: number;
  lastOrientation: 'portrait' | 'landscape';
  suppressionActive: boolean;
  suppressionStartTimestamp: number;
  frameId?: number;
  timeoutId?: number;
}

interface ViewportController {
  forceRecalc: () => void;
  forceRebaseline: () => void;
  getState: () => Readonly<ViewportState>;
}

// Global state
let state: ViewportState = {
  initialHeight: 0,
  lastAppliedHeight: 0,
  lastOrientation: 'portrait',
  suppressionActive: false,
  suppressionStartTimestamp: 0,
};

// Event handlers (named for proper HMR cleanup)
let orientationQuery: MediaQueryList | null = null;
let resizeController: AbortController | null = null;
let focusController: AbortController | null = null;

// Debug logging
const isDebugEnabled = () => {
  return typeof window !== 'undefined' && 
         window.location.search.includes('vhdebug') && 
         process.env.NODE_ENV !== 'production';
};

const debugLog = (message: string, ...args: unknown[]) => {
  if (isDebugEnabled()) {
    console.log(`[ViewportHeight] ${message}`, ...args);
  }
};

/**
 * Get current viewport height using visualViewport API with fallback
 */
const getCurrentHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Use visualViewport if available (more accurate on mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // Fallback to window.innerHeight
  return window.innerHeight;
};

/**
 * Get current orientation
 */
const getCurrentOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'portrait';
  
  // Use matchMedia for orientation detection
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  return isPortrait ? 'portrait' : 'landscape';
};

/**
 * Check if an editable element is currently focused
 */
const isEditableElementFocused = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  // Check for input elements
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    return true;
  }
  
  // Check for contentEditable
  if (activeElement.getAttribute('contenteditable') === 'true') {
    return true;
  }
  
  return false;
};

/**
 * Update CSS custom properties with new height values
 */
const updateCSSProperties = (height: number) => {
  if (typeof document === 'undefined') return;
  
  const vh = height * 0.01;
  
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  document.documentElement.style.setProperty('--app-height', `${height}px`);
  
  // Set initial height baseline on first call
  if (state.initialHeight === 0) {
    document.documentElement.style.setProperty('--app-vh-initial', `${vh}px`);
  }
  
  debugLog('CSS properties updated', { height, vh });
};

/**
 * Check if current height change should trigger an orientation rebaseline
 */
const shouldRebaselineForOrientation = (currentHeight: number): boolean => {
  const heightDelta = Math.abs(currentHeight - state.lastAppliedHeight);
  const deltaRatio = heightDelta / Math.max(state.initialHeight, 1);
  const hasEditableFocus = isEditableElementFocused();
  
  // Large height change without editable focus suggests orientation change
  return deltaRatio > ORIENTATION_DELTA_RATIO && !hasEditableFocus;
};

/**
 * Handle height changes with suppression logic
 */
const handleHeightChange = () => {
  const currentHeight = getCurrentHeight();
  const currentOrientation = getCurrentOrientation();
  const hasEditableFocus = isEditableElementFocused();
  
  debugLog('Height change detected', {
    currentHeight,
    lastApplied: state.lastAppliedHeight,
    orientation: currentOrientation,
    editableFocused: hasEditableFocus,
    suppressionActive: state.suppressionActive
  });
  
  // Check for orientation change
  if (currentOrientation !== state.lastOrientation) {
    debugLog('Orientation change detected', {
      from: state.lastOrientation,
      to: currentOrientation
    });
    
    // Force rebaseline on orientation change
    state.lastOrientation = currentOrientation;
    state.suppressionActive = false;
    state.lastAppliedHeight = currentHeight;
    updateCSSProperties(currentHeight);
    return;
  }
  
  // Check for large delta that might indicate orientation change
  if (shouldRebaselineForOrientation(currentHeight)) {
    debugLog('Large delta detected - treating as orientation change');
    state.suppressionActive = false;
    state.lastAppliedHeight = currentHeight;
    updateCSSProperties(currentHeight);
    return;
  }
  
  // Calculate suppression thresholds
  const shrinkThreshold = state.initialHeight * SHRINK_SUPPRESS_RATIO;
  const resumeThreshold = state.initialHeight * RESUME_RATIO;
  
  // Handle suppression logic
  if (hasEditableFocus && currentHeight < shrinkThreshold && !state.suppressionActive) {
    // Start suppression
    state.suppressionActive = true;
    state.suppressionStartTimestamp = Date.now();
    debugLog('Suppression started', { currentHeight, threshold: shrinkThreshold });
    
    // Set safety timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    state.timeoutId = window.setTimeout(() => {
      if (state.suppressionActive && !isEditableElementFocused()) {
        debugLog('Suppression auto-cleared due to timeout');
        state.suppressionActive = false;
      }
    }, SUPPRESSION_TIMEOUT);
    
    return; // Don't update height while suppressed
  }
  
  // End suppression conditions
  if (state.suppressionActive) {
    const shouldEndSuppression = 
      !hasEditableFocus || // Focus lost
      currentHeight >= resumeThreshold; // Height resumed
    
    if (shouldEndSuppression) {
      debugLog('Suppression ended', { 
        reason: !hasEditableFocus ? 'focus lost' : 'height resumed',
        currentHeight,
        resumeThreshold
      });
      
      state.suppressionActive = false;
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = undefined;
      }
    } else {
      return; // Still suppressed
    }
  }
  
  // Update height if not suppressed
  state.lastAppliedHeight = currentHeight;
  updateCSSProperties(currentHeight);
};

/**
 * Debounced height change handler using requestAnimationFrame
 */
const debouncedHeightChange = () => {
  if (state.frameId) {
    cancelAnimationFrame(state.frameId);
  }
  
  state.frameId = requestAnimationFrame(() => {
    state.frameId = undefined;
    handleHeightChange();
  });
};

/**
 * Named event handlers for proper cleanup
 */
const handleResize = () => debouncedHeightChange();
const handleVisualViewportResize = () => debouncedHeightChange();
const handleOrientationChange = () => debouncedHeightChange();
const handleFocusIn = () => debouncedHeightChange();
const handleFocusOut = () => debouncedHeightChange();

/**
 * Initialize viewport height handling
 */
export const initViewportHeight = (): void => {
  if (typeof window === 'undefined') {
    debugLog('Not in browser environment, skipping initialization');
    return;
  }
  
  debugLog('Initializing viewport height handling');
  
  // Clean up any existing handlers
  cleanup();
  
  // Initialize state
  const initialHeight = getCurrentHeight();
  const initialOrientation = getCurrentOrientation();
  
  state = {
    initialHeight,
    lastAppliedHeight: initialHeight,
    lastOrientation: initialOrientation,
    suppressionActive: false,
    suppressionStartTimestamp: 0,
  };
  
  debugLog('Initial state', state);
  
  // Set initial CSS properties
  updateCSSProperties(initialHeight);
  
  // Set up event listeners with AbortController for cleanup
  resizeController = new AbortController();
  focusController = new AbortController();
  
  // Window resize events
  window.addEventListener('resize', handleResize, {
    signal: resizeController.signal,
    passive: true
  });
  
  // Visual viewport events (if supported)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportResize, {
      signal: resizeController.signal,
      passive: true
    });
  }
  
  // Orientation change events
  orientationQuery = window.matchMedia('(orientation: portrait)');
  if (orientationQuery.addEventListener) {
    orientationQuery.addEventListener('change', handleOrientationChange, {
      signal: resizeController.signal
    });
  } else {
    // Fallback for older browsers
    orientationQuery.addListener(handleOrientationChange);
  }
  
  // Focus events for editable elements
  document.addEventListener('focusin', handleFocusIn, {
    signal: focusController.signal,
    passive: true
  });
  
  document.addEventListener('focusout', handleFocusOut, {
    signal: focusController.signal,
    passive: true
  });
  
  debugLog('Event listeners attached');
};

/**
 * Cleanup function for HMR and disposal
 */
const cleanup = (): void => {
  debugLog('Cleaning up viewport handlers');
  
  // Cancel any pending animation frames
  if (state.frameId) {
    cancelAnimationFrame(state.frameId);
    state.frameId = undefined;
  }
  
  // Clear timeout
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = undefined;
  }
  
  // Abort event listeners
  if (resizeController) {
    resizeController.abort();
    resizeController = null;
  }
  
  if (focusController) {
    focusController.abort();
    focusController = null;
  }
  
  // Clean up orientation query listener (fallback method)
  if (orientationQuery && orientationQuery.removeListener) {
    orientationQuery.removeListener(handleOrientationChange);
  }
  orientationQuery = null;
};

/**
 * Controller object for manual operations
 */
export const viewportController: ViewportController = {
  /**
   * Force immediate height recalculation
   */
  forceRecalc: () => {
    debugLog('Force recalculation requested');
    handleHeightChange();
  },
  
  /**
   * Force rebaseline with current height
   */
  forceRebaseline: () => {
    const currentHeight = getCurrentHeight();
    debugLog('Force rebaseline requested', { currentHeight });
    
    state.initialHeight = currentHeight;
    state.lastAppliedHeight = currentHeight;
    state.suppressionActive = false;
    
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = undefined;
    }
    
    updateCSSProperties(currentHeight);
  },
  
  /**
   * Get current viewport state (readonly)
   */
  getState: () => ({ ...state })
};

/**
 * HMR disposal function
 */
export const dispose = cleanup;

// Auto-cleanup on module disposal for HMR
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}