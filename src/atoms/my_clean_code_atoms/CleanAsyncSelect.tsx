import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Loader2, Check } from "lucide-react";
import type { SelectOption } from "./CleanSelect";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AsyncSelectPage {
  options:  SelectOption[];
  hasMore:  boolean;
}

export interface AsyncSelectFetchParams {
  search: string;
  page:   number;
  limit:  number;
}

export interface CleanAsyncSelectProps {
  label?:            string;
  value?:             string;
  /** Shown as the selected label before/without a matching loaded option (e.g. editing an existing record). */
  selectedLabel?:     string;
  onChange:           (value: string, option: SelectOption | null) => void;
  /** Loads one page of options — implement search + pagination against your API here. */
  fetchPage:          (params: AsyncSelectFetchParams) => Promise<AsyncSelectPage>;
  pageSize?:          number;
  debounceMs?:        number;
  placeholder?:       string;
  searchPlaceholder?: string;
  emptyText?:         string;
  error?:             string;
  hint?:              string;
  disabled?:          boolean;
  required?:          boolean;
  clearable?:         boolean;
  style?:             React.CSSProperties;
  id?:                string;
  zIndex?:            number;
}

// ── Component ──────────────────────────────────────────────────────────────

export const CleanAsyncSelect: React.FC<CleanAsyncSelectProps> = ({
  label,
  value = "",
  selectedLabel,
  onChange,
  fetchPage,
  pageSize   = 20,
  debounceMs = 350,
  placeholder       = "Select…",
  searchPlaceholder = "Search…",
  emptyText         = "No results found",
  error,
  hint,
  disabled = false,
  required = false,
  clearable = false,
  style,
  id,
  zIndex = 60,
}) => {
  const [isOpen,        setIsOpen]        = useState(false);
  const [search,        setSearch]        = useState("");
  const [debounced,     setDebounced]     = useState("");
  const [options,       setOptions]       = useState<SelectOption[]>([]);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState(selectedLabel ?? "");

  const rootRef   = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  // Keep the displayed label in sync with an externally-supplied one
  // (e.g. parent knows the record's name before any options are loaded).
  useEffect(() => { setResolvedLabel(selectedLabel ?? ""); }, [selectedLabel, value]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Fetch page 1 whenever the panel opens or the search term changes
  const loadFirstPage = useCallback(async (searchTerm: string) => {
    const myRequest = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetchPage({ search: searchTerm, page: 1, limit: pageSize });
      if (myRequest !== requestId.current) return;
      setOptions(res.options);
      setHasMore(res.hasMore);
      setPage(1);
    } catch {
      if (myRequest !== requestId.current) return;
      setOptions([]);
      setHasMore(false);
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  }, [fetchPage, pageSize]);

  useEffect(() => {
    if (!isOpen) return;
    loadFirstPage(debounced);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, debounced]);

  // Prime the option list once on mount (closed) so an already-selected value
  // can resolve its label immediately — without this, a static/async select
  // that already has a `value` shows a blank trigger until first opened.
  useEffect(() => {
    if (!value || selectedLabel) return;
    loadFirstPage("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const myRequest = requestId.current;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchPage({ search: debounced, page: nextPage, limit: pageSize });
      if (myRequest !== requestId.current) return;
      setOptions((prev) => [...prev, ...res.options]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch {
      /* keep existing options on error */
    } finally {
      setLoadingMore(false);
    }
  }, [debounced, fetchPage, hasMore, loadingMore, page, pageSize]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading || loadingMore || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 60) loadMore();
  };

  const openPanel = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearch("");
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const selectOption = (opt: SelectOption) => {
    setResolvedLabel(opt.label);
    onChange(opt.value, opt);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvedLabel("");
    onChange("", null);
  };

  const displayLabel = resolvedLabel || options.find((o) => o.value === value)?.label || "";

  const triggerStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", width: "100%", height: "var(--fi-height)",
    padding: "0 10px", background: "var(--fi-bg)",
    border: `1px solid ${error ? "var(--fi-border-error)" : isOpen ? "var(--fi-border-focus)" : "var(--fi-border)"}`,
    borderRadius: "var(--fi-radius)",
    boxShadow: isOpen && !error ? "var(--fi-shadow-focus)" : "none",
    fontSize: "var(--fi-font-size)",
    color: displayLabel ? "var(--fi-text)" : "var(--fi-muted)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    transition: "border-color 140ms ease, box-shadow 140ms ease",
  };

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative", ...style }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 12, fontWeight: 500, color: "var(--fi-label)", userSelect: "none" }}>
          {label}
          {required && <span style={{ color: "var(--fi-border-error)", marginLeft: 2 }}>*</span>}
        </label>
      )}

      <div id={id} role="button" tabIndex={disabled ? -1 : 0} style={triggerStyle} onClick={openPanel}>
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayLabel || placeholder}
        </span>
        {clearable && displayLabel && !disabled && (
          <span
            onClick={clearSelection}
            style={{ display: "flex", alignItems: "center", marginRight: 4, color: "var(--fi-muted)" }}
            title="Clear"
          >
            ×
          </span>
        )}
        <ChevronDown style={{ width: 13, height: 13, color: "var(--fi-muted)", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 140ms ease" }} />
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex,
          background: "var(--fi-bg-panel)", border: "1px solid var(--fi-border)",
          borderRadius: "var(--fi-radius)", boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ padding: 8, borderBottom: "1px solid var(--fi-border)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 8px",
              background: "var(--fi-bg)", border: "1px solid var(--fi-border)", borderRadius: 6,
            }}>
              <Search style={{ width: 12, height: 12, color: "var(--fi-muted)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "var(--fi-text)" }}
              />
              {loading && <Loader2 style={{ width: 12, height: 12, color: "var(--fi-muted)", animation: "spin 1s linear infinite" }} />}
            </div>
          </div>

          <div ref={listRef} onScroll={handleScroll} style={{ maxHeight: 220, overflowY: "auto" }}>
            {!loading && options.length === 0 && (
              <div style={{ padding: "16px 12px", fontSize: 12.5, color: "var(--fi-muted)", textAlign: "center" }}>
                {emptyText}
              </div>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => !opt.disabled && selectOption(opt)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    padding: "8px 12px", fontSize: 13, cursor: opt.disabled ? "not-allowed" : "pointer",
                    opacity: opt.disabled ? 0.5 : 1,
                    background: isSelected ? "var(--sb-hover)" : "transparent",
                    color: "var(--fi-text)",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--sb-hover)"; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                  {isSelected && <Check style={{ width: 13, height: 13, color: "var(--btn-primary-bg)", flexShrink: 0 }} />}
                </div>
              );
            })}
            {loadingMore && (
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                <Loader2 style={{ width: 14, height: 14, color: "var(--fi-muted)", animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 11, color: "var(--fi-border-error)" }}>{error}</span>}
      {!error && hint && <span style={{ fontSize: 11, color: "var(--fi-muted)" }}>{hint}</span>}
    </div>
  );
};

export default CleanAsyncSelect;

// ── Static-list adapter ──────────────────────────────────────────────────────
// Wraps a plain, in-memory SelectOption[] (branch names, enums, etc.) so it can
// be driven through CleanAsyncSelect too — search filters client-side, paging
// slices the filtered list. Use this instead of the native CleanSelect anywhere
// a small fixed option list would otherwise need a plain <select>.
export function staticOptionsFetchPage(
  options: SelectOption[],
  pageSize = 50,
): (params: AsyncSelectFetchParams) => Promise<AsyncSelectPage> {
  return async ({ search, page, limit = pageSize }: AsyncSelectFetchParams) => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? options.filter((o) => o.label.toLowerCase().includes(term))
      : options;
    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);
    return { options: slice, hasMore: start + limit < filtered.length };
  };
}
