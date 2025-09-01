/**
 * Viewport height utilities for fixing Android Chrome viewport issues
 * Provides dynamic CSS custom property for accurate viewport height calculation
 */

/**
 * Set the --app-vh CSS custom property to 1% of the actual viewport height
 * This works around the 100vh bug on mobile browsers where 100vh includes the address bar
 */
export function setViewportUnit(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}

/**
 * Initialize viewport height tracking with event listeners
 * Should be called once before React render to ensure correct initial height
 */
export function initViewportHeight(): void {
  // Set initial value
  setViewportUnit();
  
  // Create handler for events
  const handler = () => setViewportUnit();
  
  // Listen for resize and orientation changes
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);
  
  // Update height when returning to tab (handles browser chrome changes)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setViewportUnit();
    }
  });
  
  // Clean up listeners on HMR (Vite hot reload) to avoid duplicates
  if (import.meta && (import.meta as { hot?: { dispose: (fn: () => void) => void } }).hot) {
    (import.meta as { hot: { dispose: (fn: () => void) => void } }).hot.dispose(() => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    });
  }
}