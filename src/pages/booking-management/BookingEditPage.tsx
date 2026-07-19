import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Loader2, Phone, MapPin, Building2, Sparkles, Wallet } from "lucide-react";
import { selectAccessToken } from "../../store/slices/authSlice";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { patchData } from "../../services/crmServices";
import {
  BRANCH_FETCH_PAGE, BOOKING_VIA_FETCH_PAGE, BOOKING_STATUS_FETCH_PAGE, PACKAGE_FETCH_PAGE,
  PAYMENT_METHOD_FETCH_PAGE, PAYMENT_STATUS_FETCH_PAGE,
  makeHouseHelperFetchPage,
  extractLatLngFromMapUrl, reverseGeocodeLatLng,
  type BookingVia, type BookingStatus,
} from "./CreateBookingModal";
import {
  CleanButton, CleanInput, CleanAsyncSelect,
} from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────

export interface BookingEditData {
  _id:                string;
  reference_id?:      string;
  user_name?:          string;
  user_phone?:         string;
  address?:            string;
  live_location_url?:  string;
  branch?:             string;
  booking_via?:        BookingVia;
  booking_status?:     BookingStatus;
  package_name?:       string;
  cleaner_id?:         string;
  cleaner_name?:          string;
  cleaner_mobile_number?: string;
  payment_method?:     string;
  payment_amount?:     number;
  payment_status?:     string;
}

type EditFields = {
  user_name:         string;
  user_phone:        string;
  address:           string;
  live_location_url: string;
  branch:            string;
  booking_via:       BookingVia;
  booking_status:    BookingStatus;
  package_name:      string;
  cleaner_id:        string;
  payment_method:    string;
  payment_amount:    string;
  payment_status:    string;
};

type Props = {
  data:      BookingEditData;
  onBack:    () => void;
  onSaved:   (updated: Record<string, unknown>) => void;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function dataToFields(d: BookingEditData): EditFields {
  return {
    user_name:         d.user_name         ?? "",
    user_phone:        d.user_phone        ?? "",
    address:           d.address           ?? "",
    live_location_url: d.live_location_url ?? "",
    branch:            d.branch            ?? "jalandhar",
    booking_via:       d.booking_via       ?? "whatsapp_to_crm",
    booking_status:    d.booking_status    ?? "ongoing",
    package_name:      d.package_name      ?? "",
    cleaner_id:        d.cleaner_id        ?? "",
    payment_method:    d.payment_method    ?? "online",
    payment_amount:    d.payment_amount != null ? String(d.payment_amount) : "",
    payment_status:    d.payment_status    ?? "paid",
  };
}

function extractErrorMessage(err: unknown): string {
  const data = (err as any)?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return (data.errors as string[]).join(" · ");
  return data?.message ?? (err as any)?.message ?? "Failed to update booking";
}

// ── Sub-components ─────────────────────────────────────────────────────────

type AccentColor = "blue" | "green" | "purple" | "amber" | "teal";

const ACCENT_STYLE: Record<AccentColor, React.CSSProperties> = {
  blue:   { background: "var(--badge-blue-bg)",   color: "var(--badge-blue-text)"   },
  green:  { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
  purple: { background: "var(--badge-purple-bg)", color: "var(--badge-purple-text)" },
  amber:  { background: "var(--badge-amber-bg)",  color: "var(--badge-amber-text)"  },
  teal:   { background: "var(--badge-green-bg)",  color: "var(--badge-green-text)"  },
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

// ── Component ──────────────────────────────────────────────────────────────

const BookingEditPage: React.FC<Props> = ({ data, onBack, onSaved }) => {
  const token = useSelector(selectAccessToken);

  const [fields, setFields] = useState<EditFields>(() => dataToFields(data));
  const [errors, setErrors] = useState<Partial<Record<keyof EditFields, string>>>({});
  const [saving, setSaving] = useState(false);
  const [addressFetching, setAddressFetching] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState<{ name?: string; mobile?: string }>({
    name: data.cleaner_name, mobile: data.cleaner_mobile_number,
  });

  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    setFields(dataToFields(data));
    setErrors({});
    setSelectedHelper({ name: data.cleaner_name, mobile: data.cleaner_mobile_number });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data._id]);

  // House helper search + pagination — feeds CleanAsyncSelect.
  const cleanerFetchPage = useMemo(() => makeHouseHelperFetchPage(token), [token]);

  const setField = <K extends keyof EditFields>(key: K, val: EditFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLocationUrl = (value: string) => {
    setField("live_location_url", value);

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    if (geocodeAbort.current) { geocodeAbort.current.abort(); geocodeAbort.current = null; }
    setAddressFetching(false);
    if (!value.trim()) return;

    geocodeTimer.current = setTimeout(async () => {
      const coords = extractLatLngFromMapUrl(value);
      if (!coords) return;
      const ctrl = new AbortController();
      geocodeAbort.current = ctrl;
      setAddressFetching(true);
      try {
        const addr = await reverseGeocodeLatLng(coords.lat, coords.lng, ctrl.signal);
        if (ctrl.signal.aborted) return;
        if (addr) setFields((prev) => ({ ...prev, address: addr }));
      } finally {
        if (!ctrl.signal.aborted) setAddressFetching(false);
      }
    }, 700);
  };

  const validate = () => {
    const e: Partial<Record<keyof EditFields, string>> = {};
    if (!fields.user_phone.trim()) e.user_phone = "Phone is required";
    if (!fields.address.trim())    e.address    = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        user_name:         fields.user_name         || undefined,
        user_phone:        fields.user_phone,
        address:           fields.address,
        live_location_url: fields.live_location_url || undefined,
        branch:            fields.branch            || undefined,
        booking_via:       fields.booking_via,
        booking_status:    fields.booking_status,
        package_name:      fields.package_name      || undefined,
        cleaner_id:        fields.cleaner_id        || undefined,
        payment_method:    fields.payment_method    || undefined,
        payment_amount:    fields.payment_amount !== "" ? Number(fields.payment_amount) : undefined,
        payment_status:    fields.payment_status    || undefined,
      };
      await patchData({ endpoint: `bookings/${data._id}`, token, instance: "identity", data: payload });

      showToastnew.success("Booking updated");
      onSaved({
        ...payload,
        cleaner_name:          selectedHelper.name,
        cleaner_mobile_number: selectedHelper.mobile,
      });
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--dt-bg)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", borderBottom: "1px solid var(--fi-border)",
        flexShrink: 0, background: "var(--fi-bg)", flexWrap: "wrap",
      }}>
        <CleanButton variant="outline" size="sm" iconLeft={<ArrowLeft style={{ width: 13, height: 13 }} />} onClick={onBack} disabled={saving}>
          Back
        </CleanButton>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--fi-text)" }}>Edit Booking</p>
          {data.reference_id && (
            <p style={{ margin: "2px 0 0", fontSize: 12, fontFamily: "ui-monospace, monospace", color: "var(--fi-muted)" }}>
              {data.reference_id}
            </p>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <CleanButton variant="outline" size="sm" onClick={onBack} disabled={saving}>Cancel</CleanButton>
        <CleanButton variant="primary" size="sm" onClick={handleSave} loading={saving}>Save Changes</CleanButton>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 14, maxWidth: 1040, alignItems: "start",
        }}>

          <SectionCard icon={<Phone style={{ width: 14, height: 14 }} />} title="Customer" accent="blue">
            <div className="form-grid">
              <CleanInput label="Customer Name" type="text"
                value={fields.user_name} placeholder="Full name"
                onChange={(e) => setField("user_name", e.target.value)} />
              <CleanInput label="Phone" required type="text"
                value={fields.user_phone} placeholder="+91XXXXXXXXXX"
                error={errors.user_phone}
                onChange={(e) => setField("user_phone", e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard icon={<MapPin style={{ width: 14, height: 14 }} />} title="Location" accent="green">
            <div className="form-grid">
              <div className="form-grid-full">
                <CleanInput label="Address" required type="text"
                  value={fields.address} placeholder="Building / PG Name, Room No."
                  error={errors.address}
                  hint={addressFetching ? "Fetching address from map…" : undefined}
                  onChange={(e) => setField("address", e.target.value)} />
              </div>
              <div className="form-grid-full">
                <CleanInput label="Live Location URL" type="url"
                  value={fields.live_location_url} placeholder="Paste Google Maps URL or lat,lng…"
                  suffix={addressFetching ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : undefined}
                  onChange={(e) => handleLocationUrl(e.target.value)} />
              </div>
              <CleanAsyncSelect label="Branch"
                value={fields.branch} fetchPage={BRANCH_FETCH_PAGE}
                onChange={(value) => setField("branch", value)} />
            </div>
          </SectionCard>

          <SectionCard icon={<Building2 style={{ width: 14, height: 14 }} />} title="Booking Info" accent="purple">
            <div className="form-grid">
              <CleanAsyncSelect label="Booking Via"
                value={fields.booking_via} fetchPage={BOOKING_VIA_FETCH_PAGE}
                onChange={(value) => setField("booking_via", value as BookingVia)} />
              <CleanAsyncSelect label="Status"
                value={fields.booking_status} fetchPage={BOOKING_STATUS_FETCH_PAGE}
                onChange={(value) => setField("booking_status", value as BookingStatus)} />
              <div className="form-grid-full">
                <CleanAsyncSelect label="Package Name"
                  value={fields.package_name} fetchPage={PACKAGE_FETCH_PAGE}
                  placeholder="Select package…"
                  clearable
                  onChange={(value) => setField("package_name", value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<Sparkles style={{ width: 14, height: 14 }} />} title="House Helper" accent="amber">
            <CleanAsyncSelect label="House Helper"
              value={fields.cleaner_id}
              selectedLabel={selectedHelper.name}
              fetchPage={cleanerFetchPage}
              placeholder="Select house helper…"
              searchPlaceholder="Search by name, ID or mobile…"
              clearable
              onChange={(value, option) => {
                setField("cleaner_id", value);
                setSelectedHelper({
                  name:   option?.label,
                  mobile: option?.meta?.mobile_number as string | undefined,
                });
              }} />
          </SectionCard>

          <SectionCard icon={<Wallet style={{ width: 14, height: 14 }} />} title="Payment" accent="teal">
            <div className="form-grid">
              <CleanAsyncSelect label="Payment Method"
                value={fields.payment_method} fetchPage={PAYMENT_METHOD_FETCH_PAGE}
                onChange={(value) => setField("payment_method", value)} />
              <CleanInput label="Payment Amount" type="number"
                value={fields.payment_amount} placeholder="0"
                onChange={(e) => setField("payment_amount", e.target.value)} />
              <CleanAsyncSelect label="Payment Status"
                value={fields.payment_status} fetchPage={PAYMENT_STATUS_FETCH_PAGE}
                onChange={(value) => setField("payment_status", value)} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default BookingEditPage;
