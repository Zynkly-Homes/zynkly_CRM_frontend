import React, { useMemo } from "react";
import { Phone, MapPin, CalendarDays, CreditCard, Wallet, Receipt } from "lucide-react";
import { CleanModal, CleanButton } from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PaymentViewEntry {
  amount_paid?:    number;
  date?:           string;
  description?:    string;
  status?:         string;
  payment_method?: string;
}

export interface HouseHelperViewData {
  _id:            string;
  reference_id:   string;
  cleaner_name:   string;
  cleaner_id?:    string;
  mobile_number:  string;
  address?:       string;
  joined_at?:     string;
  is_active:      boolean;
  payments?:      PaymentViewEntry[];
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  data: HouseHelperViewData | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(n?: number): string {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  paid:      { background: "var(--badge-green-bg)", color: "var(--badge-green-text)" },
  pending:   { background: "var(--badge-amber-bg)", color: "var(--badge-amber-text)" },
  cancelled: { background: "var(--badge-red-bg)",   color: "var(--badge-red-text)"   },
};

const METHOD_STYLE: Record<string, React.CSSProperties> = {
  online: { background: "var(--badge-blue-bg)", color: "var(--badge-blue-text)" },
  cash:   { background: "var(--badge-gray-bg)", color: "var(--badge-gray-text)" },
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
};

// ── Sub-components ─────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--sb-hover)", color: "var(--fi-muted)",
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
        {label}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: "var(--fi-text)", overflowWrap: "anywhere" }}>
        {value}
      </p>
    </div>
  </div>
);

const PaymentCard: React.FC<{ entry: PaymentViewEntry }> = ({ entry }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
    padding: "10px 12px", border: "1px solid var(--fi-border)", borderRadius: 8,
    background: "var(--sc-card)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--badge-green-bg)", color: "var(--badge-green-text)",
      }}>
        <Wallet style={{ width: 15, height: 15 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--fi-text)" }}>
          {formatCurrency(entry.amount_paid)}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--fi-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.description || "No description"}
        </p>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: "var(--fi-muted)" }}>{formatDate(entry.date)}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {entry.payment_method && (
          <span style={{ ...pillStyle, ...(METHOD_STYLE[entry.payment_method] ?? {}) }}>
            {entry.payment_method.charAt(0).toUpperCase() + entry.payment_method.slice(1)}
          </span>
        )}
        {entry.status && (
          <span style={{ ...pillStyle, ...(STATUS_STYLE[entry.status] ?? {}) }}>
            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────

const HouseHelperViewModal: React.FC<Props> = ({ isOpen, onClose, onEdit, data }) => {
  const totals = useMemo(() => {
    const payments = data?.payments ?? [];
    const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount_paid ?? 0), 0);
    const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount_paid ?? 0), 0);
    return { paid, pending, count: payments.length };
  }, [data]);

  if (!data) return null;

  return (
    <CleanModal
      isOpen={isOpen}
      onClose={onClose}
      title={data.cleaner_name}
      subtitle={`Reference: ${data.reference_id}`}
      maxWidth={640}
      zIndex={99999}
      closeOnBackdrop
      headerExtra={
        <span style={{
          ...pillStyle,
          background: data.is_active ? "var(--badge-green-bg)" : "var(--badge-red-bg)",
          color:      data.is_active ? "var(--badge-green-text)" : "var(--badge-red-text)",
        }}>
          {data.is_active ? "Active" : "Inactive"}
        </span>
      }
      footer={
        <>
          <span />
          <div style={{ display: "flex", gap: 8 }}>
            <CleanButton variant="outline" size="sm" onClick={onClose}>
              Close
            </CleanButton>
            {onEdit && (
              <CleanButton variant="primary" size="sm" onClick={onEdit}>
                Edit
              </CleanButton>
            )}
          </div>
        </>
      }
    >
      {/* ── Identity grid ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <InfoRow icon={<CreditCard style={{ width: 15, height: 15 }} />} label="Cleaner ID" value={data.cleaner_id || "—"} />
        <InfoRow icon={<Phone style={{ width: 15, height: 15 }} />} label="Mobile Number" value={data.mobile_number || "—"} />
        <div style={{ gridColumn: "1 / -1" }}>
          <InfoRow icon={<MapPin style={{ width: 15, height: 15 }} />} label="Address" value={data.address || "—"} />
        </div>
        <InfoRow icon={<CalendarDays style={{ width: 15, height: 15 }} />} label="Joined At" value={formatDate(data.joined_at)} />
      </div>

      {/* ── Payments summary ─────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16,
        padding: 14, borderRadius: 10, background: "var(--sb-hover)", border: "1px solid var(--fi-border)",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fi-muted)" }}>Total Paid</p>
          <p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "var(--badge-green-text)" }}>{formatCurrency(totals.paid)}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fi-muted)" }}>Pending</p>
          <p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "var(--badge-amber-text)" }}>{formatCurrency(totals.pending)}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fi-muted)" }}>Entries</p>
          <p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "var(--fi-text)" }}>{totals.count}</p>
        </div>
      </div>

      {/* ── Payments list ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Receipt style={{ width: 13, height: 13, color: "var(--fi-muted)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
          Payment History
        </span>
      </div>

      {(!data.payments || data.payments.length === 0) ? (
        <p style={{ margin: 0, fontSize: 12, color: "var(--fi-muted)" }}>No payments recorded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
          {data.payments.map((p, i) => <PaymentCard key={i} entry={p} />)}
        </div>
      )}
    </CleanModal>
  );
};

export default HouseHelperViewModal;
