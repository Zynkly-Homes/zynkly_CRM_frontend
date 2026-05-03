import { useState, useEffect, useCallback } from "react";
import {
  STORAGE_KEYS,
  SIDEBAR_EVENTS,
  BREAKPOINTS,
  CSS_VARS,
  SIDEBAR_WIDTH,
} from "../constants";

interface UseSidebarOptions {
  collapsedProp?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface UseSidebarReturn {
  collapsed: boolean;
  isMobile: boolean;
  mobileExpanded: boolean;
  openItems: Set<string>;
  setCollapsed: (next: boolean) => void;
  setMobileExpanded: (next: boolean) => void;
  toggleAccordion: (name: string) => void;
  onNavClick: () => void;
}

export const useSidebar = ({
  collapsedProp,
  onCollapsedChange,
}: UseSidebarOptions): UseSidebarReturn => {

  // ── Window width / mobile detection ─────────────────────────────────────
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < BREAKPOINTS.MOBILE;

  // ── Collapsed state (controlled / uncontrolled hybrid) ───────────────────
  const [_collapsed, _setCollapsed] = useState<boolean>(() => {
    if (collapsedProp !== undefined) return collapsedProp;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (stored !== null) return stored === "true";
    } catch { /* ignore */ }
    return typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.MOBILE;
  });

  // Keep internal state in sync when parent controls it
  useEffect(() => {
    if (collapsedProp !== undefined) _setCollapsed(collapsedProp);
  }, [collapsedProp]);

  const collapsed = collapsedProp !== undefined ? collapsedProp : _collapsed;

  const setCollapsed = useCallback((next: boolean) => {
    _setCollapsed(next);
    onCollapsedChange?.(next);
    try { localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next)); } catch { /* ignore */ }
  }, [onCollapsedChange]);

  // ── Sync CSS variable so layout can react without prop drilling ──────────
  useEffect(() => {
    document.documentElement.style.setProperty(
      CSS_VARS.SIDEBAR_WIDTH,
      isMobile || collapsed ? SIDEBAR_WIDTH.CLOSED : SIDEBAR_WIDTH.OPEN
    );
  }, [collapsed, isMobile]);

  // ── Accordion open items ─────────────────────────────────────────────────
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Collapse all groups when sidebar collapses or goes mobile
  useEffect(() => {
    if (collapsed || isMobile) setOpenItems(new Set());
  }, [collapsed, isMobile]);

  const toggleAccordion = useCallback((name: string) => {
    if (collapsed && !mobileExpanded) return;
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, [collapsed]);

  // ── Mobile panel ──────────────────────────────────────────────────────────
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    const onToggle = () => setMobileExpanded((s) => !s);
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEYS.TOGGLE_TIMESTAMP) setMobileExpanded((s) => !s);
    };

    window.addEventListener(SIDEBAR_EVENTS.TOGGLE, onToggle);
    window.addEventListener(SIDEBAR_EVENTS.TOGGLE_MOBILE, onToggle);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(SIDEBAR_EVENTS.TOGGLE, onToggle);
      window.removeEventListener(SIDEBAR_EVENTS.TOGGLE_MOBILE, onToggle);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // ── Nav click handler: close mobile panel on link click ──────────────────
  const onNavClick = useCallback(() => {
    if (isMobile && mobileExpanded) setMobileExpanded(false);
  }, [isMobile, mobileExpanded]);

  return {
    collapsed,
    isMobile,
    mobileExpanded,
    openItems,
    setCollapsed,
    setMobileExpanded,
    toggleAccordion,
    onNavClick,
  };
};