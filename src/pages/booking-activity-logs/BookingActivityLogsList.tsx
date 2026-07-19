import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../store/slices/authSlice";
import { selectApiKey, openApiKeyModal } from "../../store/slices/apiKeySlice";
import { ListFilter, RefreshCw } from "lucide-react";
import { CustomDatagrid, type GridColumn } from "../../atoms/CustomDatagrid";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData } from "../../services/crmServices";
import { emitNavDone } from "../../atoms/NavigationProgress";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import {
  CleanButton, CleanFilterPanel, CleanFilterChips,
  type SelectOption, type FilterFieldConfig,
} from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PATCH";
type HitBy = "jwt" | "api_key" | "jwt+api_key" | "anonymous";

interface BookingActivityLogItem {
  _id:              string;
  method:           HttpMethod;
  endpoint:         string;
  booking_id?:      string;
  status_code:      number;
  response_time_ms: number;
  user_id?:         string;
  user_name?:       string;
  user_email?:      string;
  hit_by:           HitBy;
  ip?:              string;
  createdAt:        string;
}

interface LogsApiResponse {
  success: boolean; message: string;
  data: { data: BookingActivityLogItem[]; total: number; page: number; limit: number; totalPages: number };
}

interface Filters {
  method:      string;
  status_code: string;
  booking_id:  string;
  user_id:     string;
  hit_by:      string;
  date_from:   string;
  date_to:     string;
  sort_by:     string;
}

const EMPTY: Filters = {
  method: "", status_code: "", booking_id: "", user_id: "",
  hit_by: "", date_from: "", date_to: "", sort_by: "",
};

const FILTERS_STORAGE_KEY = "booking-activity-logs:filters";
const ENDPOINT = "booking-activity-logs";
const PER_PAGE = 100;

// ── Statics ────────────────────────────────────────────────────────────────

const METHOD_OPTIONS: SelectOption[] = [
  { value: "GET",   label: "GET"   },
  { value: "POST",  label: "POST"  },
  { value: "PATCH", label: "PATCH" },
];

const HIT_BY_OPTIONS: SelectOption[] = [
  { value: "jwt",         label: "JWT"          },
  { value: "api_key",     label: "API Key"      },
  { value: "jwt+api_key", label: "JWT + API Key" },
  { value: "anonymous",   label: "Anonymous"    },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
];

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: "select", key: "sort_by",     label: "Sort By",  options: SORT_OPTIONS, placeholder: "Latest first" },
  { type: "select", key: "method",      label: "Method",   options: METHOD_OPTIONS, placeholder: "All methods" },
  { type: "text",   key: "status_code", label: "Status Code", placeholder: "e.g. 200, 403…" },
  { type: "select", key: "hit_by",      label: "Authenticated Via", options: HIT_BY_OPTIONS, placeholder: "Any" },
  { type: "text",   key: "booking_id",  label: "Booking ID", placeholder: "Exact booking _id…" },
  { type: "text",   key: "user_id",     label: "User ID",    placeholder: "Caller's user_id…" },
  { type: "date-range", fromKey: "date_from", toKey: "date_to", label: "Log Date" },
];

const pillStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
};

const METHOD_STYLE: Record<HttpMethod, React.CSSProperties> = {
  GET:   { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  POST:  { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  PATCH: { background: "var(--badge-amber-bg)",  color: "var(--badge-amber-text)"  },
};

const HIT_BY_STYLE: Record<HitBy, React.CSSProperties> = {
  jwt:           { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  api_key:       { background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" },
  "jwt+api_key": { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  anonymous:     { background: "var(--badge-gray-bg)",   color: "var(--badge-gray-text)"   },
};

function statusStyle(code: number): React.CSSProperties {
  if (code >= 200 && code < 300) return { background: "var(--badge-green-bg)", color: "var(--badge-green-text)" };
  if (code >= 400 && code < 500) return { background: "var(--badge-red-bg)",   color: "var(--badge-red-text)"   };
  if (code >= 500) return { background: "var(--badge-red-bg)", color: "var(--badge-red-text)" };
  return { background: "var(--badge-gray-bg)", color: "var(--badge-gray-text)" };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Columns ──────────────────────────────────────────────────────────────

const COLUMNS: GridColumn<BookingActivityLogItem>[] = [
  {
    field: "method", headerName: "Method", minWidth: 90,
    renderCell: ({ row }) => <span style={{ ...pillStyle, ...METHOD_STYLE[row.method] }}>{row.method}</span>,
  },
  {
    field: "endpoint", headerName: "Endpoint", minWidth: 260,
    renderCell: ({ row }) => (
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "var(--dt-dim)" }}>{row.endpoint}</span>
    ),
  },
  {
    field: "status_code", headerName: "Status", minWidth: 90,
    renderCell: ({ row }) => <span style={{ ...pillStyle, ...statusStyle(row.status_code) }}>{row.status_code}</span>,
  },
  {
    field: "response_time_ms", headerName: "Latency", minWidth: 90,
    renderCell: ({ row }) => <span style={{ fontSize: 12, color: "var(--dt-text)" }}>{row.response_time_ms} ms</span>,
  },
  {
    field: "user_name", headerName: "Caller", minWidth: 190,
    renderCell: ({ row }) => (
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--dt-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.user_name || "—"}
        </p>
        {row.user_email && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--dt-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.user_email}
          </p>
        )}
      </div>
    ),
  },
  {
    field: "hit_by", headerName: "Authenticated Via", minWidth: 140,
    renderCell: ({ row }) => <span style={{ ...pillStyle, ...HIT_BY_STYLE[row.hit_by] }}>{row.hit_by}</span>,
  },
  {
    field: "booking_id", headerName: "Booking ID", minWidth: 160,
    renderCell: ({ row }) => row.booking_id ? (
      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, background: "var(--dt-header)", color: "var(--dt-text)", padding: "2px 7px", borderRadius: 5 }}>
        {row.booking_id}
      </span>
    ) : <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>—</span>,
  },
  {
    field: "ip", headerName: "IP Address", minWidth: 120,
    renderCell: ({ row }) => <span style={{ fontSize: 12, color: "var(--dt-dim)" }}>{row.ip || "—"}</span>,
  },
  {
    field: "createdAt", headerName: "Logged At", minWidth: 170,
    renderCell: ({ row }) => <span style={{ fontSize: 12, color: "var(--dt-muted)" }}>{formatDateTime(row.createdAt)}</span>,
  },
];

// ── Component ──────────────────────────────────────────────────────────────

const BookingActivityLogsList: React.FC = () => {
  const token  = useSelector(selectAccessToken);
  const apiKey = useSelector(selectApiKey);
  const dispatch = useDispatch();

  const [data,    setData]    = React.useState<BookingActivityLogItem[]>([]);
  const [filters, setFilters] = useLocalStorageState<Filters>(FILTERS_STORAGE_KEY, EMPTY);
  const [total,   setTotal]   = React.useState(0);
  const [loading,     setLoading]     = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore,     setHasMore]     = React.useState(false);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);

  const filterButtonRef = useRef<HTMLSpanElement>(null);
  const pageRef = useRef(1);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const setFilter = useCallback(
    (key: string, val: string) => setFilters((f) => ({ ...f, [key]: val })),
    [setFilters],
  );
  const clearAllFilters = useCallback(() => setFilters(EMPTY), [setFilters]);
  const removeFilters = useCallback((keys: string[]) => {
    setFilters((f) => {
      const next = { ...f };
      keys.forEach((k) => { (next as Record<string, string>)[k] = ""; });
      return next;
    });
  }, [setFilters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const buildParams = useCallback(
    (page: number) => ({
      page, limit: PER_PAGE,
      method:      filters.method || undefined,
      status_code: filters.status_code || undefined,
      booking_id:  filters.booking_id || undefined,
      user_id:     filters.user_id || undefined,
      hit_by:      filters.hit_by || undefined,
      date_from:   filters.date_from || undefined,
      date_to:     filters.date_to || undefined,
      sort_by:     filters.sort_by || undefined,
    }),
    [filters],
  );

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (!apiKey) { dispatch(openApiKeyModal(false)); return; }

      let signal: AbortSignal | undefined;
      if (!append) {
        fetchAbortRef.current?.abort();
        fetchAbortRef.current = new AbortController();
        signal = fetchAbortRef.current.signal;
      }

      append ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getData<LogsApiResponse>({
          endpoint: ENDPOINT, token: token ?? undefined, instance: "identity",
          params: buildParams(page), signal,
        });
        setData((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
        setTotal(res.data.total);
        setHasMore(page < res.data.totalPages);
        pageRef.current = page;
      } catch (err: unknown) {
        const name = (err as any)?.name ?? (err as any)?.code;
        if (name === "AbortError" || name === "CanceledError") return;
        showToastnew.error("Failed to fetch activity logs");
      } finally {
        if (!signal?.aborted) {
          append ? setLoadingMore(false) : setLoading(false);
          if (!append) requestAnimationFrame(() => requestAnimationFrame(() => emitNavDone()));
        }
      }
    },
    [token, apiKey, dispatch, buildParams],
  );

  useEffect(() => { pageRef.current = 1; setData([]); fetchPage(1, false); }, [fetchPage]);

  const handleLoadMore = useCallback(() => fetchPage(pageRef.current + 1, true), [fetchPage]);
  const handleRefresh  = useCallback(() => { pageRef.current = 1; setData([]); fetchPage(1, false); }, [fetchPage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--dt-bg)" }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderBottom: "1px solid var(--fi-border)",
        flexShrink: 0, flexWrap: "wrap", background: "var(--fi-bg)",
      }}>
        <span ref={filterButtonRef} style={{ display: "inline-flex" }}>
          <CleanButton
            variant="outline" size="sm"
            iconLeft={<ListFilter style={{ width: 13, height: 13 }} />}
            badge={activeFilterCount > 0 ? activeFilterCount : undefined}
            onClick={() => setShowFilterPanel((v) => !v)}
            style={activeFilterCount > 0
              ? { borderColor: "var(--badge-blue-text)", color: "var(--badge-blue-text)", boxShadow: "0 0 0 1px var(--badge-blue-text) inset" }
              : { color: "var(--badge-blue-text)" }}
          >
            Filter
          </CleanButton>
        </span>

        <CleanFilterPanel
          variant="drawer"
          isOpen={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          fields={FILTER_FIELDS}
          values={filters}
          onChange={setFilter}
          onClear={clearAllFilters}
          activeCount={activeFilterCount}
          triggerRef={filterButtonRef}
          title="Filter Activity Logs"
        />

        <div style={{ flex: 1 }} />

        <CleanButton variant="outline" size="sm" iconLeft={<RefreshCw style={{ width: 13, height: 13 }} />} onClick={handleRefresh}>
          Refresh
        </CleanButton>
      </div>

      {/* ── Active filter chips ────────────────────────────────────────────────── */}
      {activeFilterCount > 0 && (
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--fi-border)", background: "var(--fi-bg)" }}>
          <CleanFilterChips
            fields={FILTER_FIELDS}
            values={filters}
            onRemove={removeFilters}
            onClearAll={clearAllFilters}
          />
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CustomDatagrid<BookingActivityLogItem>
          rows={data}
          columns={COLUMNS}
          getRowId={(row) => row._id}
          isLoading={loading}
          totalItems={total}
          onScrollPagination
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onRefresh={handleRefresh}
          emptyStateTitle="No activity logs found"
          emptyStateSubtitle="Try adjusting your filters"
        />
      </div>
    </div>
  );
};

export default BookingActivityLogsList;
