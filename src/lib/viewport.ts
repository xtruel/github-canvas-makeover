/**
 * Android Dynamic Viewport Height Workaround
 * 
 * Solves the 100vh issue on Android Chrome where the URL bar collapsing/expanding 
 * causes layout jumpiness. Uses a custom CSS property --app-vh calculated from 
 * window.innerHeight that updates on resize, orientation change, and visibility change.
 */

/**
 * Sets the --app-vh custom property to 1% of the current inner height
 */
export function setViewportUnit(): void {
  if (typeof window === 'undefined') return;
  
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}

/**
 * Initializes viewport height handling with proper event listeners and HMR cleanup
 */
export function initViewportHeight(): void {
  if (typeof window === 'undefined') return;

  // Set initial value
  setViewportUnit();

  // Event handlers
  const handleResize = () => setViewportUnit();
  const handleOrientationChange = () => setViewportUnit();
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setViewportUnit();
    }
  };

  // Add event listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Handle DOMContentLoaded if script runs before full load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setViewportUnit);
  }

  // Vite HMR cleanup
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('DOMContentLoaded', setViewportUnit);
    });
  }
}