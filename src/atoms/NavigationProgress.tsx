import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { LoaderOverlay } from "./LoaderOverlay";

export const NAV_START_EVENT = "app:nav-start";

export const emitNavStart = (): void =>
  void window.dispatchEvent(new CustomEvent(NAV_START_EVENT));

export const NavigationProgress: React.FC = () => {
  const [pending, setPending]   = useState(false);
  const location                = useLocation();
  const isFirst                 = useRef(true);
  const safetyTimer             = useRef<number>(0);

  useEffect(() => {
    const show = () => {
      clearTimeout(safetyTimer.current);
      setPending(true);
      safetyTimer.current = window.setTimeout(() => setPending(false), 10_000);
    };
    window.addEventListener(NAV_START_EVENT, show);
    return () => {
      window.removeEventListener(NAV_START_EVENT, show);
      clearTimeout(safetyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    clearTimeout(safetyTimer.current);
    setPending(false);
  }, [location.pathname]);

  if (!pending) return null;
  return createPortal(<LoaderOverlay show />, document.body);
};
