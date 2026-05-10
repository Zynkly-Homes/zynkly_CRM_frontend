import { useEffect } from "react";

/**
 * useIOSViewport
 *
 * Handles two iOS Safari quirks that `100dvh` alone doesn't fully solve:
 *
 * 1. Sets `--vh` CSS variable to the true inner height ÷ 100.
 *    Use `height: calc(var(--vh, 1dvh) * 100)` as a fallback for older iOS.
 *
 * 2. Listens to `visualViewport` resize (keyboard open/close, zoom) so the
 *    variable stays accurate while the software keyboard is shown.
 *    This prevents content from being hidden under the iOS keyboard.
 *
 * 3. Locks body scroll on iOS when a modal is open (iOS doesn't support
 *    `overflow: hidden` on body reliably — we use `position: fixed` instead).
 *
 * Place this hook in App.tsx or the root layout so it runs once globally.
 */
export function useIOSViewport(): void {
  useEffect(() => {
    const setVh = () => {
      // visualViewport.height excludes the keyboard height on iOS
      const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
    };

    setVh();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh, { passive: true });
      window.visualViewport.addEventListener("scroll", setVh, { passive: true });
    } else {
      window.addEventListener("resize", setVh, { passive: true });
      window.addEventListener("orientationchange", setVh, { passive: true });
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
        window.visualViewport.removeEventListener("scroll", setVh);
      } else {
        window.removeEventListener("resize", setVh);
        window.removeEventListener("orientationchange", setVh);
      }
    };
  }, []);
}

/**
 * Locks body scroll for iOS Safari (where overflow:hidden on body doesn't work).
 * Returns an unlock function.
 *
 * Usage in a modal:
 *   useEffect(() => {
 *     if (isOpen) return lockBodyScroll();
 *   }, [isOpen]);
 */
export function lockBodyScroll(): () => void {
  const scrollY = window.scrollY;
  const body = document.body;

  // Only apply the iOS fix — feature-detect via -webkit-touch-callout
  const isIOS = CSS.supports("-webkit-touch-callout", "none");

  if (isIOS) {
    body.style.position = "fixed";
    body.style.top      = `-${scrollY}px`;
    body.style.width    = "100%";
    body.classList.add("ios-scroll-locked");
  } else {
    body.style.overflow = "hidden";
  }

  return () => {
    if (isIOS) {
      body.style.position = "";
      body.style.top      = "";
      body.style.width    = "";
      body.classList.remove("ios-scroll-locked");
      window.scrollTo(0, scrollY);
    } else {
      body.style.overflow = "";
    }
  };
}
