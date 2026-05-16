import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

export const NAV_START_EVENT = "app:nav-start";
export const NAV_DONE_EVENT  = "app:nav-done";

export const emitNavStart = (): void =>
  void window.dispatchEvent(new CustomEvent(NAV_START_EVENT));

// Call this when the page's primary API data finishes loading
export const emitNavDone = (): void =>
  void window.dispatchEvent(new CustomEvent(NAV_DONE_EVENT));

// ── State machine ──────────────────────────────────────────────────────────
// IDLE → LOADING (navStart)
// LOADING → ROUTE_CHANGED (location.pathname changed)
// ROUTE_CHANGED → DONE (navDone OR 2s safety timer)
// Any → LOADING (new navStart resets everything)
// DONE → IDLE (after fade)
type Phase = "idle" | "loading" | "route_changed" | "done";

export const NavigationProgress: React.FC = () => {
  const [phase, setPhase]       = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const location                = useLocation();
  const isFirst                 = useRef(true);
  const t1 = useRef<number>(0);
  const t2 = useRef<number>(0);
  const t3 = useRef<number>(0);

  const clearAll = () => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
    clearTimeout(t3.current);
  };

  const complete = () => {
    clearAll();
    setProgress(100);
    setPhase("done");
    t3.current = window.setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 380);
  };

  // navStart → begin fake-fill
  useEffect(() => {
    const onStart = () => {
      clearAll();
      setPhase("loading");
      setProgress(0);
      requestAnimationFrame(() => {
        setProgress(25);
        t1.current = window.setTimeout(() => setProgress(55), 180);
        t2.current = window.setTimeout(() => setProgress(75), 520);
      });
    };
    window.addEventListener(NAV_START_EVENT, onStart);
    return () => { window.removeEventListener(NAV_START_EVENT, onStart); clearAll(); };
  }, []);

  // navDone → complete bar (only if we're past the loading phase)
  useEffect(() => {
    const onDone = () => {
      // Only act if bar is active
      setPhase(prev => {
        if (prev === "idle") return prev; // already gone, ignore
        complete();
        return "done";
      });
    };
    window.addEventListener(NAV_DONE_EVENT, onDone);
    return () => window.removeEventListener(NAV_DONE_EVENT, onDone);
  }, []);

  // Route changed → advance to 88%, wait up to 2s for navDone
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    setPhase(prev => {
      if (prev === "idle") return prev; // no active navigation
      clearAll();
      setProgress(88);
      // Safety: auto-complete if navDone never fires within 2s
      t2.current = window.setTimeout(complete, 2000);
      return "route_changed";
    });
  }, [location.pathname]);

  if (phase === "idle") return null;

  return createPortal(
    <div
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        right:         0,
        height:        3,
        zIndex:        999999,
        pointerEvents: "none",
        opacity:       phase === "done" ? 0 : 1,
        transition:    phase === "done" ? "opacity 350ms ease" : "none",
      }}
    >
      <div
        style={{
          height:       "100%",
          width:        `${progress}%`,
          background:   "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
          borderRadius: "0 2px 2px 0",
          boxShadow:    "0 0 10px rgba(79,70,229,0.5)",
          transition:   progress === 100
            ? "width 180ms ease"
            : progress === 88
            ? "width 250ms ease"
            : "width 620ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>,
    document.body
  );
};
