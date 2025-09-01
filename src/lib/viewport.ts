/*
 * Dynamic Visual Viewport Handling Utility
 * - Mitigates 100vh issues on mobile (iOS/Android) with soft keyboard + rotation.
 * - Exposes CSS custom properties on :root:
 *     --app-vh         : current 1% of dynamic viewport height (in px)
 *     --app-height     : current dynamic viewport height (in px)
 *     --app-vh-initial : baseline 1% at (re)baseline moment
 * - Global controller available at window.viewportController
 * - Debug mode: add ?vhdebug to URL (non-production) to see [vh] logs.
 */

export interface ViewportController {
  forceRecalc(reason?: string): void;
  forceRebaseline(reason?: string): void;
  dispose(): void;
}

// Heuristic constants (can be tweaked if needed)
const SHRINK_SUPPRESS_RATIO = 0.75;      // Suppress when focused editable shrinks below 75% of baseline
const RESUME_RATIO = 0.85;               // Resume once we grow back to >=85% OR focus lost
const ORIENTATION_DELTA_RATIO = 0.20;    // Large jump w/out focus triggers rebaseline
const AUTO_CLEAR_SUPPRESSION_MS = 3000;  // Safety auto-clear window

// Internal symbol placed on window for HMR guard
const GLOBAL_KEY = '__APP_VH_CTRL';

// Production detection (support both process.env & Vite import.meta)
const isProd = (() => {
  try {
    // @ts-ignore - process may be undefined
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return true;
  } catch {}
  try {
    // @ts-ignore - import.meta may be undefined in some bundlers
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'production') return true;
  } catch {}
  return false;
})();

const debugEnabled = !isProd && typeof location !== 'undefined' && /[?&]vhdebug\b/i.test(location.search);
const log = (msg: string, ...args: any[]) => { if (debugEnabled) console.log(`[vh] ${msg}`, ...args); };

function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  try {
    if (window.matchMedia('(orientation: portrait)').matches) return 'portrait';
    return 'landscape';
  } catch {
    // Fallback using aspect
    return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
  }
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true;
  if (el.hasAttribute('contenteditable')) {
    const val = el.getAttribute('contenteditable');
    return val === '' || val === 'true';
  }
  return false;
}

interface InternalState {
  initialHeight: number;
  lastAppliedHeight: number;
  lastOrientation: 'portrait' | 'landscape';
  suppressionActive: boolean;
  suppressionStart: number | null;
  disposed: boolean;
  rafHandle: number | null;
  pendingReason: string | undefined;
}

function currentViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  const vv = (window as any).visualViewport as VisualViewport | undefined;
  const h = vv?.height ?? window.innerHeight;
  return h || 0;
}

function applyCSS(height: number, baseline: number) {
  const root = document.documentElement;
  // height corresponds to full dynamic viewport height.
  const vhUnit = height / 100;
  const initialVhUnit = baseline / 100;
  root.style.setProperty('--app-height', `${height.toFixed(2)}px`);
  root.style.setProperty('--app-vh', `${vhUnit.toFixed(4)}px`);
  root.style.setProperty('--app-vh-initial', `${initialVhUnit.toFixed(4)}px`);
}

function initViewportHeight(): ViewportController {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // SSR noop
    return {
      forceRecalc() {},
      forceRebaseline() {},
      dispose() {},
    };
  }

  // HMR / singleton guard
  const existing = (window as any)[GLOBAL_KEY] as ViewportController | undefined;
  if (existing) {
    log('reuse existing controller');
    return existing;
  }

  const state: InternalState = {
    initialHeight: 0,
    lastAppliedHeight: 0,
    lastOrientation: getOrientation(),
    suppressionActive: false,
    suppressionStart: null,
    disposed: false,
    rafHandle: null,
    pendingReason: undefined,
  };

  function rebaseline(reason: string) {
    if (state.disposed) return;
    const h = currentViewportHeight();
    if (!h || !isFinite(h)) return;
    state.initialHeight = h;
    state.lastAppliedHeight = h;
    state.lastOrientation = getOrientation();
    applyCSS(h, state.initialHeight);
    log(`rebaseline (${reason})`, { h });
  }

  function endSuppression(reason: string) {
    if (state.suppressionActive) {
      state.suppressionActive = false;
      state.suppressionStart = null;
      log(`suppress-end (${reason})`);
    }
  }

  function maybeAutoClearSuppression(now: number) {
    if (state.suppressionActive && state.suppressionStart != null) {
      if (now - state.suppressionStart > AUTO_CLEAR_SUPPRESSION_MS) {
        const active = document.activeElement;
        // Only auto-clear if no eligible focus OR height has recovered significantly
        if (!isEditableElement(active) || currentViewportHeight() >= RESUME_RATIO * state.initialHeight) {
          endSuppression('auto-clear');
        }
      }
    }
  }

  function recalc(reason?: string) {
    if (state.disposed) return;
    const hRaw = currentViewportHeight();
    if (!hRaw || !isFinite(hRaw)) return; // ignore bogus values

    const orientationNow = getOrientation();
    const activeEl = document.activeElement;
    const focusedEditable = isEditableElement(activeEl);
    const now = performance.now();

    maybeAutoClearSuppression(now);

    // Orientation change triggers immediate rebaseline.
    if (orientationNow !== state.lastOrientation) {
      rebaseline('orientation');
      return;
    }

    // Determine shrink suppression start.
    if (!state.suppressionActive && focusedEditable && state.initialHeight > 0) {
      if (hRaw < SHRINK_SUPPRESS_RATIO * state.initialHeight) {
        state.suppressionActive = true;
        state.suppressionStart = now;
        log('suppress-start', { hRaw, initial: state.initialHeight });
      }
    }

    // Resume conditions.
    if (state.suppressionActive) {
      const resume = !focusedEditable || hRaw >= RESUME_RATIO * state.initialHeight;
      if (resume) {
        endSuppression('resume-condition');
      }
    }

    // Large delta rebaseline (only when not focused on editable and not suppressed)
    if (!focusedEditable && !state.suppressionActive && state.initialHeight > 0) {
      const deltaRatio = Math.abs(hRaw - state.lastAppliedHeight) / state.initialHeight;
      if (deltaRatio > ORIENTATION_DELTA_RATIO) {
        rebaseline('large-delta');
        return;
      }
    }

    let heightToApply = hRaw;

    if (state.suppressionActive) {
      // While suppressed, prevent shrinking below last applied; allow growth.
      if (hRaw < state.lastAppliedHeight) {
        heightToApply = state.lastAppliedHeight; // freeze at last
      }
    }

    if (heightToApply !== state.lastAppliedHeight) {
      state.lastAppliedHeight = heightToApply;
      applyCSS(heightToApply, state.initialHeight || heightToApply);
      log(`apply (${reason || 'event'})`, { h: heightToApply, suppressed: state.suppressionActive });
    }
  }

  function schedule(reason?: string) {
    if (state.disposed) return;
    state.pendingReason = reason || state.pendingReason;
    if (state.rafHandle != null) return;
    state.rafHandle = requestAnimationFrame(() => {
      const r = state.pendingReason;
      state.rafHandle = null;
      state.pendingReason = undefined;
      recalc(r);
    });
  }

  // Event handlers
  const vv: VisualViewport | undefined = (window as any).visualViewport;
  const onVVResize = () => schedule('vv-resize');
  const onVVScroll = () => schedule('vv-scroll'); // scroll can adjust layout
  const onWinResize = () => schedule('win-resize');
  const onOrientation = () => schedule('orientationchange');
  const onFocus = () => schedule('focus');
  const onBlur = () => schedule('blur');

  // Initial baseline & apply
  rebaseline('init');
  recalc('init-apply');
  log('init complete');

  // Bind events
  if (vv) {
    vv.addEventListener('resize', onVVResize);
    vv.addEventListener('scroll', onVVScroll);
  }
  window.addEventListener('resize', onWinResize, { passive: true });
  window.addEventListener('orientationchange', onOrientation);
  // Use capture to detect focus/blur transitions early
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);

  const controller: ViewportController = {
    forceRecalc(reason = 'manual') {
      log(`forceRecalc (${reason})`);
      schedule(`force:${reason}`);
    },
    forceRebaseline(reason = 'manual') {
      log(`forceRebaseline (${reason})`);
      rebaseline(reason);
    },
    dispose() {
      if (state.disposed) return;
      state.disposed = true;
      if (state.rafHandle != null) cancelAnimationFrame(state.rafHandle);
      if (vv) {
        vv.removeEventListener('resize', onVVResize);
        vv.removeEventListener('scroll', onVVScroll);
      }
      window.removeEventListener('resize', onWinResize);
      window.removeEventListener('orientationchange', onOrientation);
      document.removeEventListener('focus', onFocus, true);
      document.removeEventListener('blur', onBlur, true);
      log('disposed');
      if ((window as any)[GLOBAL_KEY] === controller) {
        delete (window as any)[GLOBAL_KEY];
        delete (window as any).viewportController;
      }
    },
  };

  (window as any)[GLOBAL_KEY] = controller;
  (window as any).viewportController = controller;

  return controller;
}

// Exported for consumer
export { initViewportHeight };

// Augment global Window typing
declare global {
  interface Window {
    viewportController?: ViewportController;
    [GLOBAL_KEY]?: ViewportController; // Not strictly necessary but clarifies
  }
}