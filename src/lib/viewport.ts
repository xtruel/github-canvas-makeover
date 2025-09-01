/**
 * Dynamic Visual Viewport Height Management
 * 
 * Handles portrait height freeze and soft-keyboard shrink issues on mobile devices
 * by dynamically managing CSS custom properties based on visual viewport changes.
 */

// Configuration constants
const SHRINK_SUPPRESS_RATIO = 0.75;
const RESUME_RATIO = 0.85;
const ORIENTATION_DELTA_RATIO = 0.20;
const AUTO_CLEAR_SUPPRESSION_MS = 3000;

// TypeScript interfaces
export interface ViewportController {
  forceRecalc(reason?: string): void;
  forceRebaseline(reason?: string): void;
  dispose(): void;
}

// Internal state interface
interface ViewportState {
  initialHeight: number;
  lastAppliedHeight: number;
  lastOrientation: 'portrait' | 'landscape';
  suppressionActive: boolean;
  suppressionStartTimestamp: number;
  rafId: number | null;
  pendingUpdate: boolean;
}

// Event handler references for cleanup
interface EventHandlers {
  visualViewportResize: () => void;
  visualViewportScroll: () => void;
  windowOrientationChange: () => void;
  windowResize: () => void;
  documentFocus: (event: Event) => void;
  documentBlur: (event: Event) => void;
}

// Global instance key for HMR safety
const GLOBAL_KEY = '__APP_VH_CTRL';

class ViewportControllerImpl implements ViewportController {
  private state: ViewportState;
  private handlers: EventHandlers;
  private debugMode: boolean;

  constructor() {
    this.debugMode = this.isDebugMode();
    this.state = this.initializeState();
    this.handlers = this.createEventHandlers();
    this.bindEvents();
    this.log('init', `Initialized with height: ${this.state.initialHeight}px`);
  }

  private isDebugMode(): boolean {
    return typeof window !== 'undefined' && 
           location.search.includes('vhdebug') && 
           process.env.NODE_ENV !== 'production';
  }

  private log(type: string, message: string): void {
    if (this.debugMode) {
      console.log(`[vh] ${type}: ${message}`);
    }
  }

  private initializeState(): ViewportState {
    const currentHeight = this.getCurrentViewportHeight();
    const initialOrientation = this.getCurrentOrientation();
    
    const state: ViewportState = {
      initialHeight: currentHeight,
      lastAppliedHeight: currentHeight,
      lastOrientation: initialOrientation,
      suppressionActive: false,
      suppressionStartTimestamp: 0,
      rafId: null,
      pendingUpdate: false
    };

    // Set initial CSS properties
    this.updateCSSProperties(currentHeight, currentHeight);
    
    return state;
  }

  private getCurrentViewportHeight(): number {
    if (typeof window === 'undefined') return 0;
    
    if (window.visualViewport && window.visualViewport.height > 0) {
      return window.visualViewport.height;
    }
    
    return window.innerHeight;
  }

  private getCurrentOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'portrait';
    
    // Try matchMedia first
    if (window.matchMedia) {
      return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }
    
    // Fallback to dimensions
    const height = this.getCurrentViewportHeight();
    const width = window.visualViewport?.width || window.innerWidth;
    return height > width ? 'portrait' : 'landscape';
  }

  private isFocusedElementEditable(): boolean {
    if (typeof document === 'undefined') return false;
    
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    return activeElement.matches('input, textarea, [contenteditable="true"], [contenteditable=""]');
  }

  private updateCSSProperties(currentHeight: number, initialHeight: number): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const appVh = currentHeight / 100;
    const initialVh = initialHeight / 100;
    
    root.style.setProperty('--app-vh', `${appVh}px`);
    root.style.setProperty('--app-height', `${currentHeight}px`);
    root.style.setProperty('--app-vh-initial', `${initialVh}px`);
  }

  private shouldSuppressShrink(currentHeight: number): boolean {
    const isFocused = this.isFocusedElementEditable();
    const isSignificantShrink = currentHeight < (SHRINK_SUPPRESS_RATIO * this.state.initialHeight);
    
    return isFocused && isSignificantShrink;
  }

  private shouldResumeSuppression(currentHeight: number): boolean {
    if (!this.state.suppressionActive) return false;
    
    const isFocused = this.isFocusedElementEditable();
    const hasReachedResumeThreshold = currentHeight >= (RESUME_RATIO * this.state.initialHeight);
    const hasTimedOut = this.hasSuppressionTimedOut();
    
    return !isFocused || hasReachedResumeThreshold || hasTimedOut;
  }

  private hasSuppressionTimedOut(): boolean {
    if (!this.state.suppressionActive) return false;
    
    const elapsed = performance.now() - this.state.suppressionStartTimestamp;
    return elapsed > AUTO_CLEAR_SUPPRESSION_MS;
  }

  private detectOrientationChange(currentHeight: number): boolean {
    const newOrientation = this.getCurrentOrientation();
    const orientationChanged = newOrientation !== this.state.lastOrientation;
    
    if (orientationChanged) {
      this.log('rebaseline', `orientation: ${this.state.lastOrientation} -> ${newOrientation}`);
      return true;
    }
    
    // Check for large delta when no focused editable
    if (!this.isFocusedElementEditable()) {
      const delta = Math.abs(currentHeight - this.state.lastAppliedHeight);
      const deltaRatio = delta / this.state.initialHeight;
      
      if (deltaRatio > ORIENTATION_DELTA_RATIO) {
        this.log('rebaseline', `large-delta: ${deltaRatio.toFixed(3)} > ${ORIENTATION_DELTA_RATIO}`);
        return true;
      }
    }
    
    return false;
  }

  private applyHeight(newHeight: number): void {
    this.state.lastAppliedHeight = newHeight;
    this.updateCSSProperties(newHeight, this.state.initialHeight);
    this.log('apply', `height: ${newHeight}px`);
  }

  private startSuppression(): void {
    if (!this.state.suppressionActive) {
      this.state.suppressionActive = true;
      this.state.suppressionStartTimestamp = performance.now();
      this.log('suppress-start', `at height: ${this.state.lastAppliedHeight}px`);
    }
  }

  private endSuppression(): void {
    if (this.state.suppressionActive) {
      this.state.suppressionActive = false;
      this.state.suppressionStartTimestamp = 0;
      this.log('suppress-end', '');
    }
  }

  private recalculate(): void {
    const currentHeight = this.getCurrentViewportHeight();
    
    // Skip invalid heights
    if (currentHeight <= 0 || isNaN(currentHeight)) {
      return;
    }

    // Check for orientation change first (always triggers rebaseline)
    if (this.detectOrientationChange(currentHeight)) {
      this.rebaseline(currentHeight);
      return;
    }

    // Check auto-clear timeout
    if (this.state.suppressionActive && this.hasSuppressionTimedOut()) {
      this.endSuppression();
      this.log('auto-clear', 'suppression timeout reached');
    }

    // Handle suppression logic
    if (this.state.suppressionActive) {
      // While suppressed, only allow growth or resume
      if (this.shouldResumeSuppression(currentHeight)) {
        this.endSuppression();
        this.applyHeight(currentHeight);
      } else if (currentHeight >= this.state.lastAppliedHeight) {
        // Allow growth even when suppressed
        this.applyHeight(currentHeight);
      }
      // Otherwise, keep current height (ignore shrinking)
    } else {
      // Not suppressed - check if we should start suppressing
      if (this.shouldSuppressShrink(currentHeight)) {
        this.startSuppression();
        // Don't apply the shrinking height
      } else {
        // Normal case - apply the new height
        this.applyHeight(currentHeight);
      }
    }

    // Update orientation tracking
    this.state.lastOrientation = this.getCurrentOrientation();
  }

  private rebaseline(newHeight?: number): void {
    const currentHeight = newHeight || this.getCurrentViewportHeight();
    
    this.state.initialHeight = currentHeight;
    this.state.lastAppliedHeight = currentHeight;
    this.state.lastOrientation = this.getCurrentOrientation();
    
    // Clear any active suppression
    this.endSuppression();
    
    // Update CSS properties with new baseline
    this.updateCSSProperties(currentHeight, currentHeight);
    
    this.log('rebaseline', `new baseline: ${currentHeight}px`);
  }

  private scheduleUpdate(): void {
    if (this.state.pendingUpdate) return;
    
    this.state.pendingUpdate = true;
    this.state.rafId = requestAnimationFrame(() => {
      this.state.pendingUpdate = false;
      this.state.rafId = null;
      this.recalculate();
    });
  }

  private createEventHandlers(): EventHandlers {
    return {
      visualViewportResize: () => this.scheduleUpdate(),
      visualViewportScroll: () => this.scheduleUpdate(),
      windowOrientationChange: () => this.scheduleUpdate(),
      windowResize: () => this.scheduleUpdate(),
      documentFocus: () => {
        // Use next frame for focus events to ensure element is properly focused
        requestAnimationFrame(() => this.scheduleUpdate());
      },
      documentBlur: () => {
        // Use next frame for blur events to ensure element is properly blurred
        requestAnimationFrame(() => this.scheduleUpdate());
      }
    };
  }

  private bindEvents(): void {
    if (typeof window === 'undefined') return;

    // Visual viewport events (if available)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handlers.visualViewportResize);
      window.visualViewport.addEventListener('scroll', this.handlers.visualViewportScroll);
    }

    // Window events
    window.addEventListener('orientationchange', this.handlers.windowOrientationChange);
    window.addEventListener('resize', this.handlers.windowResize);

    // Document focus events (with capture to catch all focus changes)
    document.addEventListener('focus', this.handlers.documentFocus, true);
    document.addEventListener('blur', this.handlers.documentBlur, true);
  }

  private unbindEvents(): void {
    if (typeof window === 'undefined') return;

    // Visual viewport events
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handlers.visualViewportResize);
      window.visualViewport.removeEventListener('scroll', this.handlers.visualViewportScroll);
    }

    // Window events
    window.removeEventListener('orientationchange', this.handlers.windowOrientationChange);
    window.removeEventListener('resize', this.handlers.windowResize);

    // Document focus events
    document.removeEventListener('focus', this.handlers.documentFocus, true);
    document.removeEventListener('blur', this.handlers.documentBlur, true);
  }

  // Public interface methods
  public forceRecalc(reason?: string): void {
    this.log('forceRecalc', reason || 'manual');
    this.recalculate();
  }

  public forceRebaseline(reason?: string): void {
    this.log('forceRebaseline', reason || 'manual');
    this.rebaseline();
  }

  public dispose(): void {
    this.unbindEvents();
    
    if (this.state.rafId !== null) {
      cancelAnimationFrame(this.state.rafId);
      this.state.rafId = null;
    }

    // Clear global reference
    if (typeof window !== 'undefined') {
      delete (window as Record<string, unknown>)[GLOBAL_KEY];
    }
  }
}

/**
 * Initialize the dynamic viewport height management system.
 * Safe to call multiple times - returns existing instance if already initialized.
 */
export function initViewportHeight(): ViewportController {
  if (typeof window === 'undefined') {
    // Return a no-op controller for SSR
    return {
      forceRecalc: () => {},
      forceRebaseline: () => {},
      dispose: () => {}
    };
  }

  // Check for existing instance (HMR safety)
  const existing = (window as Record<string, unknown>)[GLOBAL_KEY] as ViewportController | undefined;
  if (existing) {
    return existing;
  }

  // Create new instance
  const controller = new ViewportControllerImpl();
  
  // Store globally for manual access and HMR safety
  (window as Record<string, unknown>)[GLOBAL_KEY] = controller;
  (window as Record<string, unknown>).viewportController = controller;
  
  return controller;
}