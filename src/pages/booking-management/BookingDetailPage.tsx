import React from "react";
import {
  ArrowLeft, Phone, MapPin, Building2, Sparkles, Wallet,
  CalendarClock, History, Pencil, ExternalLink,
} from "lucide-react";
import { CleanButton } from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────

type BookingStatus = "ongoing" | "completed" | "cancelled_via_user" | "cancelled_by_admin_crm";
type BookingVia = "app" | "website" | "laptop" | "whatsapp_to_crm" | "call";

export interface CancellationLogEntry {
  booking_status?: string;
  cancelled_by?:   string;
  cancelled_at?:   string;
}

export interface BookingDetailData {
  _id:                            string;
  reference_id:                   string;
  branch?:                        string;
  user_name?:                     string;
  user_phone?:                    string;
  address?:                       string;
  live_location_url?:             string;
  booking_via:                    BookingVia;
  booking_created_date_and_time?: string;
  booking_status:                 BookingStatus;
  package_name?:                  string;
  cleaner_id?:                    string;
  cleaner_name?:                  string;
  cleaner_mobile_number?:         string;
  cancellation_log?:              CancellationLogEntry[];
  cancellation_reason?:           string;
  payment_method?:                string;
  payment_amount?:                number;
  payment_status?:                string;
  is_active:                      boolean;
  createdAt?:                     string;
  updatedAt?:                     string;
}

type Props = {
  data:     BookingDetailData;
  onBack:   () => void;
  onEdit?:  () => void;
};

// ── Statics ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<BookingStatus, React.CSSProperties> = {
  ongoing:                { background: "var(--badge-amber-bg)", color: "var(--badge-amber-text)" },
  completed:              { background: "var(--badge-green-bg)", color: "var(--badge-green-text)" },
  cancelled_via_user:     { background: "var(--badge-red-bg)",   color: "var(--badge-red-text)"   },
  cancelled_by_admin_crm: { background: "var(--badge-red-bg)",   color: "var(--badge-red-text)"   },
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  ongoing: "Ongoing", completed: "Completed",
  cancelled_via_user: "Cancelled (User)", cancelled_by_admin_crm: "Cancelled (Admin)",
};

const VIA_LABEL: Record<BookingVia, string> = {
  app: "App", website: "Website", laptop: "Laptop", whatsapp_to_crm: "WhatsApp", call: "Call",
};

const PAYMENT_STATUS_STYLE: Record<string, React.CSSProperties> = {
  paid:      { background: "var(--badge-green-bg)", color: "var(--badge-green-text)" },
  pending:   { background: "var(--badge-amber-bg)", color: "var(--badge-amber-text)" },
  cancelled: { background: "var(--badge-red-bg)",   color: "var(--badge-red-text)"   },
};

const PAYMENT_METHOD_STYLE: Record<string, React.CSSProperties> = {
  online: { background: "var(--badge-blue-bg)", color: "var(--badge-blue-text)" },
  cash:   { background: "var(--badge-gray-bg)", color: "var(--badge-gray-text)" },
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(n?: number): string {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function isRealValue(v?: string): boolean {
  return !!v && v !== "N/A";
}

// ── Sub-components ─────────────────────────────────────────────────────────

type AccentColor = "blue" | "green" | "purple" | "amber" | "teal" | "gray";

const ACCENT_STYLE: Record<AccentColor, React.CSSProperties> = {
  blue:   { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  green:  { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  purple: { background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" },
  amber:  { background: "var(--badge-amber-bg)",  color: "var(--badge-amber-text)"  },
  teal:   { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  gray:   { background: "var(--badge-gray-bg)",   color: "var(--badge-gray-text)"   },
};

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; accent: AccentColor; children: React.ReactNode }> = ({ icon, title, accent, children }) => (
  <div style={{
    border: "1px solid var(--fi-border)", borderRadius: 14, padding: 16, minWidth: 0,
    background: "var(--sc-card)", display: "flex", flexDirection: "column", gap: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", boxSizing: "border-box",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, ...ACCENT_STYLE[accent],
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ minWidth: 0 }}>
    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
      {label}
    </p>
    <p style={{ margin: "4px 0 0", fontSize: 13.5, fontWeight: 500, color: "var(--fi-text)", overflowWrap: "anywhere" }}>
      {value}
    </p>
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────

const BookingDetailPage: React.FC<Props> = ({ data, onBack, onEdit }) => {
  const hasCleaner = isRealValue(data.cleaner_name);
  const hasLocationLink = isRealValue(data.live_location_url) && data.live_location_url!.startsWith("http");
  const cancellationLog = data.cancellation_log ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--dt-bg)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", borderBottom: "1px solid var(--fi-border)",
        flexShrink: 0, background: "var(--fi-bg)", flexWrap: "wrap",
      }}>
        <CleanButton variant="outline" size="sm" iconLeft={<ArrowLeft style={{ width: 13, height: 13 }} />} onClick={onBack}>
          Back
        </CleanButton>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600, color: "var(--fi-text)" }}>
              {data.reference_id}
            </span>
            <span style={{ ...pillStyle, ...STATUS_STYLE[data.booking_status] }}>
              {STATUS_LABEL[data.booking_status] ?? data.booking_status}
            </span>
            {!data.is_active && (
              <span style={{ ...pillStyle, background: "var(--badge-gray-bg)", color: "var(--badge-gray-text)" }}>Inactive</span>
            )}
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--fi-muted)" }}>{data.user_name || "—"}</p>
        </div>

        <div style={{ flex: 1 }} />

        {onEdit && (
          <CleanButton variant="primary" size="sm" iconLeft={<Pencil style={{ width: 13, height: 13 }} />} onClick={onEdit}>
            Edit Booking
          </CleanButton>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 14, maxWidth: 1040, alignItems: "start",
        }}>

          {/* Customer */}
          <SectionCard icon={<Phone style={{ width: 14, height: 14 }} />} title="Customer" accent="blue">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Name" value={data.user_name || "—"} />
              <Field label="Phone" value={data.user_phone || "—"} />
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard icon={<MapPin style={{ width: 14, height: 14 }} />} title="Location" accent="green">
            <Field label="Address" value={data.address || "—"} />
            <Field label="Branch" value={data.branch || "—"} />
            {hasLocationLink && (
              <a
                href={data.live_location_url}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--btn-primary-bg)", fontWeight: 500 }}
              >
                Open live location <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            )}
          </SectionCard>

          {/* Booking meta */}
          <SectionCard icon={<Building2 style={{ width: 14, height: 14 }} />} title="Booking Info" accent="purple">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Source" value={VIA_LABEL[data.booking_via] ?? data.booking_via} />
              <Field label="Booked At" value={formatDateTime(data.booking_created_date_and_time)} />
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Package" value={data.package_name || "—"} />
              </div>
            </div>
          </SectionCard>

          {/* House helper */}
          <SectionCard icon={<Sparkles style={{ width: 14, height: 14 }} />} title="House Helper" accent="amber">
            {hasCleaner ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Name" value={data.cleaner_name} />
                <Field label="Mobile" value={data.cleaner_mobile_number || "—"} />
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--fi-muted)" }}>No house helper assigned yet.</p>
            )}
          </SectionCard>

          {/* Payment */}
          <SectionCard icon={<Wallet style={{ width: 14, height: 14 }} />} title="Payment" accent="teal">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field
                label="Method"
                value={data.payment_method ? (
                  <span style={{ ...pillStyle, ...(PAYMENT_METHOD_STYLE[data.payment_method] ?? {}) }}>
                    {data.payment_method.charAt(0).toUpperCase() + data.payment_method.slice(1)}
                  </span>
                ) : "—"}
              />
              <Field label="Amount" value={formatCurrency(data.payment_amount)} />
              <Field
                label="Status"
                value={data.payment_status ? (
                  <span style={{ ...pillStyle, ...(PAYMENT_STATUS_STYLE[data.payment_status] ?? {}) }}>
                    {data.payment_status.charAt(0).toUpperCase() + data.payment_status.slice(1)}
                  </span>
                ) : "—"}
              />
            </div>
          </SectionCard>

          {/* Timestamps */}
          <SectionCard icon={<CalendarClock style={{ width: 14, height: 14 }} />} title="Timeline" accent="gray">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Created" value={formatDateTime(data.createdAt)} />
              <Field label="Last Updated" value={formatDateTime(data.updatedAt)} />
            </div>
          </SectionCard>

          {/* Cancellation log */}
          {cancellationLog.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <SectionCard icon={<History style={{ width: 14, height: 14 }} />} title="Cancellation History" accent="gray">
                {data.cancellation_reason && (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--fi-text)" }}>
                    <strong>Reason:</strong> {data.cancellation_reason}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cancellationLog.map((entry, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      padding: "8px 12px", border: "1px solid var(--fi-border)", borderRadius: 8,
                    }}>
                      <span style={{ ...pillStyle, ...(STATUS_STYLE[entry.booking_status as BookingStatus] ?? {}) }}>
                        {STATUS_LABEL[entry.booking_status as BookingStatus] ?? entry.booking_status ?? "—"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--fi-muted)" }}>{formatDateTime(entry.cancelled_at)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
