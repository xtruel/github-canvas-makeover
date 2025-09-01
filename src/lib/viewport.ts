/**
 * Dynamic Viewport Height Utility
 * 
 * Handles mobile viewport height issues by providing stable CSS custom properties
 * that account for dynamic browser UI (URL bars, toolbars) on iOS Safari and Android Chrome.
 * 
 * Key Features:
 * - Uses visualViewport API when available for accurate height detection
 * - Provides fallback to window.innerHeight for older browsers  
 * - Handles keyboard appearance/disappearance with smart suppression
 * - Updates CSS custom properties: --app-vh, --app-vh-initial, --app-height
 * - Debounces rapid events to prevent excessive recalculations
 * - Supports HMR cleanup
 * 
 * Why this is needed:
 * - iOS Safari: 100vh includes area behind dynamic toolbar, causing layout jumps
 * - Android Chrome: URL bar collapse/expand changes available height
 * - 100dvh has limited support and doesn't handle all edge cases
 * - visualViewport provides real usable height excluding browser UI
 * 
 * Reference: https://web.dev/viewport-units/
 */

// Track viewport state
let initialHeight = 0;
let rafScheduled = false;
let lastStableHeight = 0;
let eventListeners: Array<() => void> = [];

// Debug logging (only in development with ?vhdebug query param)
const isDebugMode = process.env.NODE_ENV !== 'production' && 
  new URLSearchParams(window.location.search).has('vhdebug');

function debugLog(message: string, height: number, reason: string) {
  if (isDebugMode) {
    console.log(`[ViewportHeight] ${message}`, { height, reason, timestamp: Date.now() });
  }
}

/**
 * Get the current usable viewport height
 * Uses visualViewport.height when available, falls back to window.innerHeight
 */
function getViewportHeight(): number {
  // Prefer visualViewport for accuracy on mobile
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // Fallback to window.innerHeight
  return window.innerHeight;
}

/**
 * Check if the active element is an input that might trigger virtual keyboard
 */
function isInputActive(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.getAttribute('contenteditable') === 'true';
  
  return tagName === 'input' || tagName === 'textarea' || isEditable;
}

/**
 * Update CSS custom properties with current viewport height
 */
function updateViewportHeight() {
  const currentHeight = getViewportHeight();
  
  // Skip update if height hasn't changed significantly (avoid micro-adjustments)
  if (Math.abs(currentHeight - lastStableHeight) < 2) {
    return;
  }
  
  // Keyboard suppression heuristic: 
  // If height shrunk dramatically and an input is focused, don't update
  if (isInputActive() && currentHeight < initialHeight * 0.75) {
    debugLog('Suppressing height update due to keyboard', currentHeight, 'keyboard_detected');
    return;
  }
  
  // If height recovered to reasonable size, resume updates
  if (currentHeight >= initialHeight * 0.85) {
    lastStableHeight = currentHeight;
  }
  
  // Only update if not suppressed
  if (!isInputActive() || currentHeight >= initialHeight * 0.85) {
    lastStableHeight = currentHeight;
    
    // Update CSS custom properties on :root
    const root = document.documentElement;
    const vh = currentHeight * 0.01; // Convert to vh equivalent
    
    root.style.setProperty('--app-vh', `${vh}px`);
    root.style.setProperty('--app-height', `${currentHeight}px`);
    
    debugLog('Updated viewport height', currentHeight, 'normal_update');
  }
}

/**
 * Debounced update function using requestAnimationFrame
 */
function scheduleUpdate() {
  if (rafScheduled) return;
  
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    updateViewportHeight();
  });
}

/**
 * Initialize viewport height tracking
 * Should be called before React renders to ensure CSS properties are available
 */
export function initViewportHeight(): void {
  // Set initial height and establish baseline
  initialHeight = getViewportHeight();
  lastStableHeight = initialHeight;
  
  // Set initial CSS custom properties
  const root = document.documentElement;
  const initialVh = initialHeight * 0.01;
  
  root.style.setProperty('--app-vh', `${initialVh}px`);
  root.style.setProperty('--app-vh-initial', `${initialVh}px`);
  root.style.setProperty('--app-height', `${initialHeight}px`);
  
  debugLog('Initialized viewport height', initialHeight, 'initialization');
  
  // Create event listeners
  const resizeListener = () => scheduleUpdate();
  const orientationListener = () => {
    // Small delay for orientation change to settle
    setTimeout(scheduleUpdate, 100);
  };
  const visibilityListener = () => {
    if (!document.hidden) {
      scheduleUpdate();
    }
  };
  
  // Standard window events
  window.addEventListener('resize', resizeListener);
  window.addEventListener('orientationchange', orientationListener);
  document.addEventListener('visibilitychange', visibilityListener);
  
  eventListeners.push(
    () => window.removeEventListener('resize', resizeListener),
    () => window.removeEventListener('orientationchange', orientationListener),
    () => document.removeEventListener('visibilitychange', visibilityListener)
  );
  
  // Visual viewport events (for iOS Safari dynamic toolbar and Android Chrome URL bar)
  if (window.visualViewport) {
    const viewportResizeListener = () => scheduleUpdate();
    const viewportScrollListener = () => scheduleUpdate();
    
    window.visualViewport.addEventListener('resize', viewportResizeListener);
    window.visualViewport.addEventListener('scroll', viewportScrollListener);
    
    eventListeners.push(
      () => window.visualViewport?.removeEventListener('resize', viewportResizeListener),
      () => window.visualViewport?.removeEventListener('scroll', viewportScrollListener)
    );
  }
}

/**
 * Force recalculation of viewport height (useful for debugging)
 */
export function forceRecalc(): void {
  updateViewportHeight();
}

/**
 * Cleanup function for HMR (Hot Module Replacement)
 */
export function cleanup(): void {
  // Remove all event listeners
  eventListeners.forEach(removeListener => removeListener());
  eventListeners = [];
  
  // Reset RAF scheduling
  rafScheduled = false;
  
  debugLog('Cleaned up viewport height listeners', 0, 'cleanup');
}

// HMR support
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanup();
  });
}