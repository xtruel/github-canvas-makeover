/**
 * Dynamic Viewport Height Management
 * 
 * Handles viewport height changes, orientation changes, and keyboard visibility
 * while providing reliable CSS custom properties for responsive layouts.
 * 
 * Features:
 * - Orientation change detection and automatic rebaseline
 * - Keyboard suppression only when editable elements are focused
 * - Large delta detection for edge cases
 * - Debug utilities and proper event listener cleanup
 * - Performance-optimized with RAF batching
 */

// Configuration constants
const SHRINK_SUPPRESS_RATIO = 0.75; // Suppress updates when height drops below 75% of initial
const RESUME_RATIO = 0.85; // Resume updates when height rises above 85% of initial
const LARGE_DELTA_THRESHOLD = 0.20; // Consider 20%+ change as potential orientation change
const SUPPRESSION_TIMEOUT = 3000; // Auto-clear suppression after 3 seconds without editable focus

// State tracking
interface ViewportState {
  initialHeight: number;
  lastAppliedHeight: number;
  lastOrientation: 'portrait' | 'landscape';
  suppressionActive: boolean;
  rafScheduled: boolean;
  suppressionTimer: number | null;
}

let state: ViewportState = {
  initialHeight: 0,
  lastAppliedHeight: 0,
  lastOrientation: 'portrait',
  suppressionActive: false,
  rafScheduled: false,
  suppressionTimer: null,
};

// Event handler references for proper cleanup
let handlers: {
  handleResize?: () => void;
  handleOrientationChange?: () => void;
  handleVisualViewportResize?: () => void;
  handleVisualViewportScroll?: () => void;
  handleVisibilityChange?: () => void;
  handleFocusIn?: (event: FocusEvent) => void;
  handleFocusOut?: (event: FocusEvent) => void;
} = {};

// Debug logging utility
function debugLog(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production' && location.search.includes('vhdebug')) {
    console.log(`[Viewport]`, message, ...args);
  }
}

// Get current orientation
function getCurrentOrientation(): 'portrait' | 'landscape' {
  // Prefer screen.orientation if available
  if (screen.orientation) {
    return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
  }
  
  // Fallback to matchMedia
  if (window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }
  
  // Last resort: compare dimensions
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

// Check if an element is editable
function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }
  
  if (element.hasAttribute('contenteditable')) {
    const value = element.getAttribute('contenteditable');
    return value === 'true' || value === '';
  }
  
  return false;
}

// Get current viewport height
function getCurrentHeight(): number {
  // Prefer visualViewport if available (more accurate on mobile)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // Fallback to window.innerHeight
  return window.innerHeight;
}

// Apply CSS custom properties
function applyVars(height: number, isRebaseline: boolean = false) {
  const vh = height / 100;
  
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  document.documentElement.style.setProperty('--app-height', `${height}px`);
  
  if (isRebaseline) {
    document.documentElement.style.setProperty('--app-vh-initial', `${vh}px`);
  }
  
  debugLog('Applied vars:', { height, vh, isRebaseline });
}

// Clear suppression timeout
function clearSuppressionTimeout() {
  if (state.suppressionTimer) {
    clearTimeout(state.suppressionTimer);
    state.suppressionTimer = null;
  }
}

// Start suppression timeout
function startSuppressionTimeout() {
  clearSuppressionTimeout();
  state.suppressionTimer = window.setTimeout(() => {
    if (state.suppressionActive && !document.activeElement || !isEditableElement(document.activeElement)) {
      debugLog('Auto-clearing suppression after timeout');
      state.suppressionActive = false;
      scheduleRecalc('suppression-timeout');
    }
  }, SUPPRESSION_TIMEOUT);
}

// Check if we should rebaseline
function shouldRebaseline(currentHeight: number, currentOrientation: 'portrait' | 'landscape'): boolean {
  // Orientation changed
  if (currentOrientation !== state.lastOrientation) {
    debugLog('Orientation changed:', state.lastOrientation, '→', currentOrientation);
    return true;
  }
  
  // Large delta without editable focus
  if (!isEditableElement(document.activeElement)) {
    const delta = Math.abs(currentHeight - state.lastAppliedHeight);
    const deltaRatio = delta / state.initialHeight;
    if (deltaRatio > LARGE_DELTA_THRESHOLD) {
      debugLog('Large delta detected:', { delta, deltaRatio, threshold: LARGE_DELTA_THRESHOLD });
      return true;
    }
  }
  
  return false;
}

// Perform viewport recalculation
function performRecalc(reason: string = 'unknown') {
  const currentHeight = getCurrentHeight();
  const currentOrientation = getCurrentOrientation();
  
  debugLog('Recalc triggered:', { reason, currentHeight, currentOrientation, state: { ...state } });
  
  // Check if we should rebaseline
  if (shouldRebaseline(currentHeight, currentOrientation)) {
    debugLog('Rebaselining:', { 
      oldInitial: state.initialHeight, 
      newInitial: currentHeight,
      oldOrientation: state.lastOrientation,
      newOrientation: currentOrientation
    });
    
    state.initialHeight = currentHeight;
    state.lastOrientation = currentOrientation;
    state.suppressionActive = false; // Clear suppression on rebaseline
    clearSuppressionTimeout();
    
    applyVars(currentHeight, true);
    state.lastAppliedHeight = currentHeight;
    return;
  }
  
  // Check for keyboard suppression
  const editableFocused = isEditableElement(document.activeElement);
  const heightDropRatio = currentHeight / state.initialHeight;
  
  if (editableFocused && heightDropRatio < SHRINK_SUPPRESS_RATIO) {
    if (!state.suppressionActive) {
      debugLog('Activating suppression:', { heightDropRatio, threshold: SHRINK_SUPPRESS_RATIO });
      state.suppressionActive = true;
      startSuppressionTimeout();
    }
    return; // Suppress update
  }
  
  // Check for suppression resume
  if (state.suppressionActive) {
    const shouldResume = heightDropRatio >= RESUME_RATIO || !editableFocused;
    if (shouldResume) {
      debugLog('Resuming from suppression:', { heightDropRatio, editableFocused, resumeThreshold: RESUME_RATIO });
      state.suppressionActive = false;
      clearSuppressionTimeout();
    } else {
      return; // Still suppressed
    }
  }
  
  // Apply the height update
  applyVars(currentHeight);
  state.lastAppliedHeight = currentHeight;
}

// Schedule recalculation with RAF batching
function scheduleRecalc(reason: string = 'unknown') {
  if (state.rafScheduled) return;
  
  state.rafScheduled = true;
  requestAnimationFrame(() => {
    state.rafScheduled = false;
    performRecalc(reason);
  });
}

// Event handlers (named for proper cleanup)
function createHandlers() {
  handlers.handleResize = () => scheduleRecalc('window-resize');
  
  handlers.handleOrientationChange = () => scheduleRecalc('orientationchange');
  
  handlers.handleVisualViewportResize = () => scheduleRecalc('visualViewport-resize');
  
  handlers.handleVisualViewportScroll = () => scheduleRecalc('visualViewport-scroll');
  
  handlers.handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      scheduleRecalc('visibility-visible');
    }
  };
  
  handlers.handleFocusIn = (event: FocusEvent) => {
    if (isEditableElement(event.target as Element)) {
      debugLog('Editable focused:', event.target);
      scheduleRecalc('editable-focus');
    }
  };
  
  handlers.handleFocusOut = (event: FocusEvent) => {
    if (isEditableElement(event.target as Element)) {
      debugLog('Editable blurred:', event.target);
      scheduleRecalc('editable-blur');
    }
  };
}

// Add event listeners
function addEventListeners() {
  if (!handlers.handleResize) createHandlers();
  
  // Window events
  window.addEventListener('resize', handlers.handleResize!);
  window.addEventListener('orientationchange', handlers.handleOrientationChange!);
  
  // Visual viewport events (if supported)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handlers.handleVisualViewportResize!);
    window.visualViewport.addEventListener('scroll', handlers.handleVisualViewportScroll!);
  }
  
  // Document events
  document.addEventListener('visibilitychange', handlers.handleVisibilityChange!);
  document.addEventListener('focusin', handlers.handleFocusIn!);
  document.addEventListener('focusout', handlers.handleFocusOut!);
  
  debugLog('Event listeners added');
}

// Remove event listeners
function removeEventListeners() {
  if (handlers.handleResize) {
    window.removeEventListener('resize', handlers.handleResize);
    window.removeEventListener('orientationchange', handlers.handleOrientationChange!);
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handlers.handleVisualViewportResize!);
      window.visualViewport.removeEventListener('scroll', handlers.handleVisualViewportScroll!);
    }
    
    document.removeEventListener('visibilitychange', handlers.handleVisibilityChange!);
    document.removeEventListener('focusin', handlers.handleFocusIn!);
    document.removeEventListener('focusout', handlers.handleFocusOut!);
    
    debugLog('Event listeners removed');
  }
  
  clearSuppressionTimeout();
  handlers = {};
}

// Initialize the viewport system
function init() {
  debugLog('Initializing viewport system');
  
  // Clean up any existing listeners
  removeEventListeners();
  
  // Reset state
  const currentHeight = getCurrentHeight();
  const currentOrientation = getCurrentOrientation();
  
  state = {
    initialHeight: currentHeight,
    lastAppliedHeight: currentHeight,
    lastOrientation: currentOrientation,
    suppressionActive: false,
    rafScheduled: false,
    suppressionTimer: null,
  };
  
  // Apply initial values
  applyVars(currentHeight, true);
  
  // Set up event listeners
  addEventListeners();
  
  debugLog('Viewport system initialized:', { 
    initialHeight: currentHeight, 
    orientation: currentOrientation 
  });
}

// Force recalculation (debug utility)
function forceRecalc(reason: string = 'manual-force') {
  debugLog('Force recalc requested:', reason);
  performRecalc(reason);
}

// Force rebaseline (debug utility)
function forceRebaseline(reason: string = 'manual-force') {
  debugLog('Force rebaseline requested:', reason);
  const currentHeight = getCurrentHeight();
  const currentOrientation = getCurrentOrientation();
  
  state.initialHeight = currentHeight;
  state.lastOrientation = currentOrientation;
  state.suppressionActive = false;
  clearSuppressionTimeout();
  
  applyVars(currentHeight, true);
  state.lastAppliedHeight = currentHeight;
}

// Viewport controller object for advanced usage
export const viewportController = {
  init,
  forceRecalc,
  forceRebaseline,
  getState: () => ({ ...state }), // Return copy for debugging
  isSupported: () => typeof window !== 'undefined' && 'visualViewport' in window,
};

// Expose to global window for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).viewportController = viewportController;
}

// Legacy API for backward compatibility
export function initViewportHeight() {
  init();
}

// Default export
export default viewportController;