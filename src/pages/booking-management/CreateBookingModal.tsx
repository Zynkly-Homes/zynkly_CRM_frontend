import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useBlocker } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { MyButton } from "../../atoms/MyButton";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { postData } from "../../services/crmServices";
import { parseBookingRawText, ParsedBookingFields } from "./bookingParser";

// ── Types ──────────────────────────────────────────────────────────────────

type BookingVia = "app" | "website" | "laptop" | "whatsapp_to_crm" | "call";

type BookingFields = ParsedBookingFields & { booking_via: BookingVia };

interface BookingEntry {
  id: string;
  rawText: string;
  fields: BookingFields;
  collapsed: boolean;
  errors: Partial<Record<keyof BookingFields, string>>;
}

interface SubmitResult {
  id: string;
  name: string;
  status: "success" | "error";
  message: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

// ── Constants ──────────────────────────────────────────────────────────────

const DRAFT_KEY = "booking_creation_draft_v1";
const BOOKING_VIA_OPTIONS: BookingVia[] = ["app", "website", "laptop", "whatsapp_to_crm", "call"];
const VIA_LABELS: Record<BookingVia, string> = {
  app: "App", website: "Website", laptop: "Laptop",
  whatsapp_to_crm: "WhatsApp → CRM", call: "Call",
};

// ── Helpers ────────────────────────────────────────────────────────────────

let entryCounter = 0;
const uid = () => `entry_${Date.now()}_${++entryCounter}`;

function emptyFields(): BookingFields {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    user_name: "",
    user_phone: "",
    address: "",
    live_location_url: "",
    branch: "",
    booking_via: "whatsapp_to_crm",
    booking_created_date_and_time:
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

function emptyEntry(): BookingEntry {
  return { id: uid(), rawText: "", fields: emptyFields(), collapsed: false, errors: {} };
}

function validateEntry(fields: BookingFields): Partial<Record<keyof BookingFields, string>> {
  const e: Partial<Record<keyof BookingFields, string>> = {};
  if (!fields.user_phone.trim()) e.user_phone = "Phone is required";
  if (!fields.address.trim())    e.address    = "Address is required";
  if (!fields.booking_via)       e.booking_via = "Source is required";
  return e;
}

function hasDraft(entries: BookingEntry[]): boolean {
  return entries.some((e) => e.rawText.trim() || e.fields.user_phone || e.fields.address);
}

function saveDraft(entries: BookingEntry[]) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
}

function loadDraft(): BookingEntry[] | null {
  try {
    const s = localStorage.getItem(DRAFT_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Failed to create booking";
}

// ── Shared input style ──────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors";
const labelCls = "block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1";
const errorCls = "text-red-500 text-xs mt-0.5";

// ── Single Entry Component ─────────────────────────────────────────────────

const BookingEntryCard: React.FC<{
  entry: BookingEntry;
  index: number;
  total: number;
  onChange: (id: string, updated: Partial<BookingEntry>) => void;
  onRemove: (id: string) => void;
}> = ({ entry, index, total, onChange, onRemove }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRawChange = (raw: string) => {
    const parsed = parseBookingRawText(raw);
    onChange(entry.id, {
      rawText: raw,
      fields: { ...parsed, booking_via: parsed.booking_via as BookingVia },
      errors: {},
    });
  };

  const setField = <K extends keyof BookingFields>(key: K, value: BookingFields[K]) => {
    onChange(entry.id, {
      fields: { ...entry.fields, [key]: value },
      errors: { ...entry.errors, [key]: undefined },
    });
  };

  const hasErrors = Object.values(entry.errors).some(Boolean);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Entry header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Booking #{index + 1}
          </span>
          {hasErrors && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(entry.id, { collapsed: !entry.collapsed })}
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label={entry.collapsed ? "Expand" : "Collapse"}
          >
            {entry.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove booking"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!entry.collapsed && (
        <div className="p-4 space-y-4">
          {/* Raw text area */}
          <div>
            <label className={labelCls}>Paste Raw Message / WhatsApp Data</label>
            <textarea
              ref={textareaRef}
              value={entry.rawText}
              onChange={(e) => handleRawChange(e.target.value)}
              rows={5}
              placeholder={`Paste WhatsApp message or raw data here…\n\nExample:\nGreen View PG\n402\n7500560748`}
              className={`${inputCls} resize-y font-mono text-xs`}
            />
            {entry.rawText && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Fields auto-filled below — edit if needed.
              </p>
            )}
          </div>

          {/* Parsed / editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>User Name</label>
              <input
                type="text"
                value={entry.fields.user_name}
                onChange={(e) => setField("user_name", e.target.value)}
                placeholder="Full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={entry.fields.user_phone}
                onChange={(e) => setField("user_phone", e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className={`${inputCls} ${entry.errors.user_phone ? "border-red-400" : ""}`}
              />
              {entry.errors.user_phone && <p className={errorCls}>{entry.errors.user_phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Address <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={entry.fields.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Building / PG Name, Room No."
                className={`${inputCls} ${entry.errors.address ? "border-red-400" : ""}`}
              />
              {entry.errors.address && <p className={errorCls}>{entry.errors.address}</p>}
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <input
                type="text"
                value={entry.fields.branch}
                onChange={(e) => setField("branch", e.target.value)}
                placeholder="e.g. jalandhar"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Booking Via <span className="text-red-400">*</span></label>
              <select
                value={entry.fields.booking_via}
                onChange={(e) => setField("booking_via", e.target.value as BookingVia)}
                className={inputCls}
              >
                {BOOKING_VIA_OPTIONS.map((v) => (
                  <option key={v} value={v}>{VIA_LABELS[v]}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Live Location URL</label>
              <input
                type="url"
                value={entry.fields.live_location_url}
                onChange={(e) => setField("live_location_url", e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date &amp; Time</label>
              <input
                type="datetime-local"
                value={entry.fields.booking_created_date_and_time}
                onChange={(e) => setField("booking_created_date_and_time", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Abandon Confirmation ───────────────────────────────────────────────────

const AbandonConfirm: React.FC<{
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}> = ({ isOpen, onStay, onLeave }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[999999]" onClose={onStay}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100"
        leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
          leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                Unsaved Bookings
              </Dialog.Title>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Your booking data is saved as a draft and will be restored when you return.
              Do you still want to leave?
            </p>
            <div className="flex justify-end gap-3">
              <MyButton variant="outline" onClick={onStay}>Stay</MyButton>
              <MyButton variant="primary" onClick={onLeave}>Leave</MyButton>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

// ── Main Modal ─────────────────────────────────────────────────────────────

const CreateBookingModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [cookies] = useCookies(["t"]);
  const [entries, setEntries] = useState<BookingEntry[]>([emptyEntry()]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmitResult[]>([]);
  const [showAbandon, setShowAbandon] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDirty = hasDraft(entries);

  // ── Draft: restore on open ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const draft = loadDraft();
    if (draft && draft.length > 0) {
      setEntries(draft);
    } else {
      setEntries([emptyEntry()]);
    }
    setResults([]);
  }, [isOpen]);

  // ── Draft: save on every change ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen) saveDraft(entries);
  }, [entries, isOpen]);

  // ── Hard refresh guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isOpen, isDirty]);

  // ── React Router navigation guard ─────────────────────────────────────────
  const blocker = useBlocker(isDirty && isOpen);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowAbandon(true);
    }
  }, [blocker.state]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateEntry = useCallback((id: string, patch: Partial<BookingEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addEntry = () => {
    const newEntry = emptyEntry();
    setEntries((prev) => [...prev, newEntry]);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const handleClose = () => {
    if (isDirty && results.length === 0) {
      setPendingClose(true);
      setShowAbandon(true);
    } else {
      clearDraft();
      onClose();
    }
  };

  const handleAbandonLeave = () => {
    setShowAbandon(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    } else if (pendingClose) {
      setPendingClose(false);
      clearDraft();
      onClose();
    }
  };

  const handleAbandonStay = () => {
    setShowAbandon(false);
    setPendingClose(false);
    if (blocker.state === "blocked") blocker.reset();
  };

  // ── Submit All ─────────────────────────────────────────────────────────────
  const handleCreateAll = async () => {
    // Validate all
    let hasError = false;
    const validated = entries.map((entry) => {
      const errors = validateEntry(entry.fields);
      if (Object.keys(errors).length > 0) hasError = true;
      return { ...entry, errors };
    });
    if (hasError) {
      setEntries(validated);
      showToastnew.error("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    const resultsArr: SubmitResult[] = [];

    for (const entry of entries) {
      try {
        const payload: Record<string, unknown> = {
          branch:   entry.fields.branch || undefined,
          user_name: entry.fields.user_name || undefined,
          user_phone: entry.fields.user_phone,
          address:  entry.fields.address,
          live_location_url: entry.fields.live_location_url || undefined,
          booking_via: entry.fields.booking_via,
          booking_created_date_and_time: entry.fields.booking_created_date_and_time
            ? new Date(entry.fields.booking_created_date_and_time).toISOString()
            : new Date().toISOString(),
        };
        await postData({ endpoint: "bookings", token: cookies.t, instance: "identity", data: payload });
        resultsArr.push({ id: entry.id, name: entry.fields.user_name || entry.fields.user_phone, status: "success", message: "Created successfully" });
      } catch (err: unknown) {
        resultsArr.push({ id: entry.id, name: entry.fields.user_name || entry.fields.user_phone, status: "error", message: extractErrorMessage(err) });
      }
    }

    setResults(resultsArr);
    setSubmitting(false);

    const allOk = resultsArr.every((r) => r.status === "success");
    if (allOk) {
      showToastnew.success(`${resultsArr.length} booking${resultsArr.length > 1 ? "s" : ""} created`);
      clearDraft();
      onCreated();
    } else {
      const failed = resultsArr.filter((r) => r.status === "error").length;
      showToastnew.error(`${failed} booking${failed > 1 ? "s" : ""} failed — see results below`);
    }
  };

  const handleDone = () => {
    clearDraft();
    onClose();
  };

  const showResults = results.length > 0;

  return (
    <>
      <AbandonConfirm isOpen={showAbandon} onStay={handleAbandonStay} onLeave={handleAbandonLeave} />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={() => {}}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-4" enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div>
                    <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                      Create Bookings
                    </Dialog.Title>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Paste raw WhatsApp messages — fields auto-fill from the text
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDirty && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Draft saved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Results panel */}
                {showResults && (
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Results</p>
                    {results.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-sm">
                        {r.status === "success"
                          ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                        <span className="font-medium text-gray-800 dark:text-gray-200">{r.name || "—"}</span>
                        <span className="text-gray-500 dark:text-gray-400">— {r.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scrollable body */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {entries.map((entry, i) => (
                    <BookingEntryCard
                      key={entry.id}
                      entry={entry}
                      index={i}
                      total={entries.length}
                      onChange={updateEntry}
                      onRemove={removeEntry}
                    />
                  ))}

                  {/* Add more */}
                  {!showResults && (
                    <button
                      type="button"
                      onClick={addEntry}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Booking
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entries.length} booking{entries.length > 1 ? "s" : ""} queued
                  </span>
                  <div className="flex items-center gap-3">
                    {showResults ? (
                      <MyButton variant="primary" onClick={handleDone}>Done</MyButton>
                    ) : (
                      <>
                        <MyButton variant="outline" onClick={handleClose} disabled={submitting}>
                          Cancel
                        </MyButton>
                        <MyButton variant="primary" onClick={handleCreateAll} isLoading={submitting}>
                          Create All ({entries.length})
                        </MyButton>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CreateBookingModal;
