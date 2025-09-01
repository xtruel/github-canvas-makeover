/**
 * Mobile viewport height handling utilities
 * 
 * Addresses Android Chrome's unstable 100vh behavior when the URL bar
 * dynamically shows/hides during scroll. Uses CSS custom property --app-vh
 * based on window.innerHeight for consistent full-height layouts.
 * 
 * References:
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/env()
 * - https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
 */

/**
 * Sets the --app-vh CSS custom property to 1% of the current viewport height
 */
export function setViewportUnit(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}

/**
 * Initializes the viewport height system with event listeners
 * Should be called once during app initialization
 */
export function initViewportHeight(): void {
  // Guard: only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Set initial value
  setViewportUnit();

  // Update on resize
  window.addEventListener('resize', setViewportUnit);
  
  // Update on orientation change (mobile devices)
  window.addEventListener('orientationchange', setViewportUnit);
  
  // Update when page becomes visible (handles browser UI changes)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setViewportUnit();
    }
  });

  // HMR cleanup for Vite development
  if ((import.meta as any).hot) {
    (import.meta as any).hot.dispose(() => {
      window.removeEventListener('resize', setViewportUnit);
      window.removeEventListener('orientationchange', setViewportUnit);
      document.removeEventListener('visibilitychange', setViewportUnit);
    });
  }
}