/**
 * Fix for environments (such as sandboxed iframes, DevTools, or preview monitors) where
 * window.fetch has only a getter without a setter on Window.prototype, causing:
 * "TypeError: Cannot set property fetch of #<Window> which has only a getter"
 * when tools, monitors, or libraries attempt to assign `window.fetch = ...`.
 */
export function ensureFetchWritable(): void {
  if (typeof window === 'undefined') return;

  try {
    let currentFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : window.fetch;

    // Define a getter and setter on window so direct assignments (window.fetch = ...) succeed cleanly
    Object.defineProperty(window, 'fetch', {
      get() {
        return currentFetch;
      },
      set(newFetch: typeof window.fetch) {
        currentFetch = newFetch;
      },
      configurable: true,
      enumerable: true,
    });

    // Also define on Window.prototype if available
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', {
          get() {
            return currentFetch;
          },
          set(newFetch: typeof window.fetch) {
            currentFetch = newFetch;
          },
          configurable: true,
          enumerable: true,
        });
      } catch {
        // Prototype may be non-configurable in some engines, ignore
      }
    }
  } catch {
    try {
      // Fallback: define as a regular writable property
      Object.defineProperty(window, 'fetch', {
        value: window.fetch,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      // Ignore if browser prevents configuration
    }
  }
}

// Execute immediately upon module import
ensureFetchWritable();
