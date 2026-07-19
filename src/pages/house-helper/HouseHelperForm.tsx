import React, { useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { postData, patchData } from "../../services/crmServices";
import {
  CleanInput, CleanAsyncSelect, staticOptionsFetchPage, type SelectOption,
} from "../../atoms/my_clean_code_atoms";

// ── Types ──────────────────────────────────────────────────────────────────

export type PaymentEntry = {
  amount_paid:    string;
  date:           string;
  description:    string;
  status:         string;
  payment_method: string;
};

type HouseHelperFormValues = {
  cleaner_name:   string;
  cleaner_id:     string;
  mobile_number:  string;
  address:        string;
  joined_at:      string;
  is_active:      string;
};

export type HouseHelperInitialValues = {
  _id?:           string;
  cleaner_name:   string;
  cleaner_id?:    string;
  mobile_number?: string;
  address?:       string;
  joined_at?:     string;
  is_active?:     boolean;
  payments?: Array<{
    amount_paid?:    number | string;
    date?:           string;
    description?:    string;
    status?:         string;
    payment_method?: string;
  }>;
};

type HouseHelperFormProps = {
  token?: string;
  formId: string;
  initialValues?: HouseHelperInitialValues;
  onSuccess: () => void;
  onSubmittingChange?: (b: boolean) => void;
  onResetReady?: (fn: () => void) => void;
};

// ── Statics ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { value: "true",  label: "Active"   },
  { value: "false", label: "Inactive" },
];

const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: "online", label: "Online" },
  { value: "cash",   label: "Cash"   },
];

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "paid",      label: "Paid"      },
  { value: "pending",   label: "Pending"   },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_FETCH_PAGE         = staticOptionsFetchPage(STATUS_OPTIONS);
const PAYMENT_METHOD_FETCH_PAGE = staticOptionsFetchPage(PAYMENT_METHOD_OPTIONS);
const PAYMENT_STATUS_FETCH_PAGE = staticOptionsFetchPage(PAYMENT_STATUS_OPTIONS);

const MOBILE_RE = /^[6-9]\d{9}$/;

let _rowCounter = 0;
const rowId = () => `pay_${Date.now()}_${++_rowCounter}`;

const emptyPaymentRow = (): PaymentEntry & { id: string } => ({
  id: rowId(), amount_paid: "", date: "", description: "",
  status: "paid", payment_method: "online",
});

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string; errors?: string[] } } }; message?: string };
  const errs = e?.error?.response?.data?.errors;
  if (Array.isArray(errs) && errs.length > 0) return errs.join(" · ");
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

// ── Component ──────────────────────────────────────────────────────────────

const HouseHelperForm: React.FC<HouseHelperFormProps> = ({
  token, formId, initialValues, onSuccess, onSubmittingChange, onResetReady,
}) => {
  const isEdit = !!initialValues?._id;

  const initialPaymentRows = useMemo<Array<PaymentEntry & { id: string }>>(
    () => (initialValues?.payments ?? []).map((p) => ({
      id: rowId(),
      amount_paid:    p.amount_paid != null ? String(p.amount_paid) : "",
      date:           toDateInputValue(p.date),
      description:    p.description ?? "",
      status:         p.status ?? "paid",
      payment_method: p.payment_method ?? "online",
    })),
    [initialValues],
  );

  const [paymentRows, setPaymentRows] = useState(initialPaymentRows);

  const validationSchema = useMemo(
    () => Yup.object({
      cleaner_name:  Yup.string().trim().required("Cleaner name is required"),
      cleaner_id:    Yup.string(),
      mobile_number: Yup.string().trim()
        .matches(MOBILE_RE, "Enter a valid 10-digit mobile number")
        .required("Mobile number is required"),
      address:       Yup.string(),
      joined_at:     Yup.string(),
      is_active:     Yup.string().required(),
    }),
    [],
  );

  const initialFormValues: HouseHelperFormValues = {
    cleaner_name:  initialValues?.cleaner_name  ?? "",
    cleaner_id:    initialValues?.cleaner_id    ?? "",
    mobile_number: initialValues?.mobile_number ?? "",
    address:       initialValues?.address       ?? "",
    joined_at:     toDateInputValue(initialValues?.joined_at),
    is_active:     initialValues?.is_active === false ? "false" : "true",
  };

  const addPaymentRow    = () => setPaymentRows((rows) => [...rows, emptyPaymentRow()]);
  const removePaymentRow = (id: string) => setPaymentRows((rows) => rows.filter((r) => r.id !== id));
  const updatePaymentRow = (id: string, patch: Partial<PaymentEntry>) =>
    setPaymentRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const buildPaymentsPayload = () =>
    paymentRows
      .filter((r) => r.amount_paid.trim() !== "")
      .map((r) => ({
        amount_paid:    Number(r.amount_paid),
        date:           r.date ? new Date(r.date).toISOString() : undefined,
        description:    r.description.trim() || undefined,
        status:         r.status || undefined,
        payment_method: r.payment_method || undefined,
      }));

  const handleSubmit = async (
    values: HouseHelperFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (b: boolean) => void; resetForm: () => void },
  ) => {
    onSubmittingChange?.(true);
    try {
      const payments = buildPaymentsPayload();
      const payload: Record<string, unknown> = {
        cleaner_name:  values.cleaner_name.trim(),
        cleaner_id:    values.cleaner_id.trim() || undefined,
        mobile_number: values.mobile_number.trim(),
        address:       values.address.trim() || undefined,
        joined_at:     values.joined_at ? new Date(values.joined_at).toISOString() : undefined,
        is_active:     values.is_active === "true",
        ...(payments.length > 0 ? { payments } : {}),
      };

      if (isEdit) {
        await patchData({
          endpoint: `cleaner-bookings/${initialValues!._id}`, token, instance: "identity",
          data: payload,
        });
        showToastnew.success("House helper updated successfully");
      } else {
        await postData({
          endpoint: "cleaner-bookings", token, instance: "identity",
          data: payload,
        });
        showToastnew.success("House helper created successfully");
        resetForm();
        setPaymentRows([]);
      }
      onSuccess();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
      onSubmittingChange?.(false);
    }
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, resetForm }) => {
        onResetReady?.(() => { resetForm(); setPaymentRows(initialPaymentRows); });

        const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
          setFieldValue("mobile_number", digitsOnly);
        };

        return (
          <Form id={formId} noValidate>
            <div className="form-grid">
              <CleanInput
                label="Cleaner Name" required placeholder="Full name"
                name="cleaner_name" value={values.cleaner_name}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.cleaner_name ? errors.cleaner_name : ""}
              />
              <CleanInput
                label="Cleaner ID" placeholder="e.g. CLN-1024"
                name="cleaner_id" value={values.cleaner_id}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.cleaner_id ? errors.cleaner_id : ""}
              />
              <CleanInput
                label="Mobile Number" required type="text" placeholder="10-digit mobile number"
                name="mobile_number" value={values.mobile_number}
                onChange={handleMobileChange} onBlur={handleBlur}
                error={touched.mobile_number ? errors.mobile_number : ""}
              />
              <CleanAsyncSelect
                label="Status" required
                value={values.is_active}
                fetchPage={STATUS_FETCH_PAGE}
                onChange={(value) => setFieldValue("is_active", value)}
                error={touched.is_active ? errors.is_active : ""}
              />
              <div className="form-grid-full">
                <CleanInput
                  label="Address" placeholder="123 Main St, Jalandhar"
                  name="address" value={values.address}
                  onChange={handleChange} onBlur={handleBlur}
                  error={touched.address ? errors.address : ""}
                />
              </div>
              <CleanInput
                label="Joined At" type="date"
                name="joined_at" value={values.joined_at}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.joined_at ? errors.joined_at : ""}
              />
            </div>

            {/* ── Payments ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--fi-muted)" }}>
                  Payments
                </span>
                <button
                  type="button"
                  onClick={addPaymentRow}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500,
                    color: "var(--btn-primary-bg)", background: "transparent", border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  <Plus style={{ width: 13, height: 13 }} /> Add entry
                </button>
              </div>

              {paymentRows.length === 0 && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--fi-muted)" }}>No payments yet.</p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {paymentRows.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      display: "flex", flexDirection: "column", gap: 8,
                      padding: 10, border: "1px solid var(--fi-border)", borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr)) auto", gap: 8, alignItems: "end" }}>
                      <CleanInput
                        label="Amount Paid" type="number" placeholder="0"
                        value={row.amount_paid}
                        onChange={(e) => updatePaymentRow(row.id, { amount_paid: e.target.value })}
                      />
                      <CleanInput
                        label="Date" type="date"
                        value={row.date}
                        onChange={(e) => updatePaymentRow(row.id, { date: e.target.value })}
                      />
                      <CleanAsyncSelect
                        label="Method"
                        value={row.payment_method}
                        fetchPage={PAYMENT_METHOD_FETCH_PAGE}
                        onChange={(value) => updatePaymentRow(row.id, { payment_method: value })}
                      />
                      <CleanAsyncSelect
                        label="Status"
                        value={row.status}
                        fetchPage={PAYMENT_STATUS_FETCH_PAGE}
                        onChange={(value) => updatePaymentRow(row.id, { status: value })}
                      />
                      <button
                        type="button"
                        onClick={() => removePaymentRow(row.id)}
                        title="Remove entry"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", padding: 6, height: "var(--fi-height)" }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                    <CleanInput
                      label="Description" placeholder="e.g. Weekly settlement"
                      value={row.description}
                      onChange={(e) => updatePaymentRow(row.id, { description: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default HouseHelperForm;
