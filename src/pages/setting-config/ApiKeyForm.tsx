import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { MyButton } from "../../atoms/MyButton";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { patchData } from "../../services/crmServices";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import type { ApiKeyItem } from "./ApiKeyManagement";

// ---- Types ----

type ApiKeyFormProps = {
  token?: string;
  initialValues?: Partial<ApiKeyItem>;
  onSuccess: () => void;
  onCreated: () => void;
};

type CreateFormValues = {
  bootstrap_key: string;
  name: string;
  usage_limit: string;
  expires_at: string;
};

type EditFormValues = {
  name: string;
  is_active: boolean;
  usage_limit: string;
  expires_at: string;
};

// ---- Validation schemas ----

const createSchema = Yup.object({
  bootstrap_key: Yup.string().trim().required("Bootstrap API key is required"),
  name:          Yup.string().trim().required("Name is required"),
  usage_limit:   Yup.string(),
  expires_at:    Yup.string(),
});

const editSchema = Yup.object({
  name:        Yup.string().trim().required("Name is required"),
  is_active:   Yup.boolean(),
  usage_limit: Yup.string(),
  expires_at:  Yup.string(),
});

// ---- Helpers ----

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? "Operation failed";
}

const IDENTITY_BASE = (import.meta.env.VITE_IDENTITY_API_URL as string | undefined) ?? "";

// ---- Shared styles ----

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

// ---- Key Reveal Banner ----

const KeyRevealBanner: React.FC<{ apiKey: string; onDone: () => void }> = ({ apiKey, onDone }) => {
  const [copied, setCopied] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToastnew.error("Failed to copy — please copy manually");
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Copy your API key now
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            This key will not be shown again after you close this panel.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            readOnly
            type={visible ? "text" : "password"}
            value={apiKey}
            className="w-full pr-10 px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label={visible ? "Hide key" : "Show key"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex justify-end">
        <MyButton variant="outline" onClick={onDone} className="!text-sm">
          Done
        </MyButton>
      </div>
    </div>
  );
};

// ---- Main Form ----

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ token, initialValues, onSuccess, onCreated }) => {
  const isEdit = Boolean(initialValues?._id);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);

  // After create — show reveal banner, then on Done close the form
  if (createdKey) {
    return (
      <KeyRevealBanner
        apiKey={createdKey}
        onDone={() => { setCreatedKey(null); onSuccess(); }}
      />
    );
  }

  // ---- Edit form ----
  if (isEdit) {
    const editInitial: EditFormValues = {
      name:        initialValues?.name ?? "",
      is_active:   initialValues?.is_active ?? true,
      usage_limit: initialValues?.usage_limit != null ? String(initialValues.usage_limit) : "",
      expires_at:  initialValues?.expires_at
        ? new Date(initialValues.expires_at).toISOString().split("T")[0]
        : "",
    };

    const handleEdit = async (
      values: EditFormValues,
      { setSubmitting }: { setSubmitting: (v: boolean) => void }
    ) => {
      try {
        const payload: Record<string, unknown> = {
          name:      values.name.trim(),
          is_active: values.is_active,
        };
        if (values.usage_limit) payload.usage_limit = Number(values.usage_limit);
        if (values.expires_at)  payload.expires_at  = values.expires_at;

        await patchData({
          endpoint: `api-keys/${initialValues!._id}`,
          token,
          instance: "identity",
          data: payload,
        });
        showToastnew.success("API key updated");
        onSuccess();
      } catch (err: unknown) {
        showToastnew.error(extractErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <Formik initialValues={editInitial} validationSchema={editSchema} enableReinitialize onSubmit={handleEdit}>
        {({ values, isSubmitting, setFieldValue }) => (
          <Form autoComplete="off" className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="edit_name" className={labelCls}>Name</label>
              <Field id="edit_name" name="name" type="text" placeholder="Key name" className={inputCls} />
              <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="edit_usage_limit" className={labelCls}>
                Usage Limit <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Field
                id="edit_usage_limit"
                name="usage_limit"
                type="number"
                min="1"
                placeholder="e.g. 1000"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="edit_expires_at" className={labelCls}>
                Expires At <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Field id="edit_expires_at" name="expires_at" type="date" className={inputCls} />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={values.is_active}
                onClick={() => setFieldValue("is_active", !values.is_active)}
                className={[
                  "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  values.is_active ? "bg-gray-700 dark:bg-gray-300" : "bg-gray-300 dark:bg-gray-600",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    values.is_active ? "translate-x-4" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {values.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <MyButton type="submit" variant="primary" isLoading={isSubmitting}>
                Update Key
              </MyButton>
            </div>
          </Form>
        )}
      </Formik>
    );
  }

  // ---- Create form ----
  const createInitial: CreateFormValues = {
    bootstrap_key: "",
    name:          "",
    usage_limit:   "",
    expires_at:    "",
  };

  const handleCreate = async (
    values: CreateFormValues,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    try {
      const payload: Record<string, unknown> = { name: values.name.trim() };
      if (values.usage_limit) payload.usage_limit = Number(values.usage_limit);
      if (values.expires_at)  payload.expires_at  = values.expires_at;

      const res = await axios.post<{ success: boolean; data: { key: string } }>(
        `${IDENTITY_BASE}/api-keys`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${token ?? ""}`,
            "x-api-key":    values.bootstrap_key.trim(),
          },
        }
      );

      const key = res.data?.data?.key;
      if (!key) throw new Error("No key in response");

      showToastnew.success("API key created — copy it now!");
      resetForm();
      onCreated();
      setCreatedKey(key);
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={createInitial} validationSchema={createSchema} onSubmit={handleCreate}>
      {({ isSubmitting }) => (
        <Form autoComplete="off" className="space-y-4 max-w-lg">
          {/* Bootstrap key */}
          <div>
            <label htmlFor="bootstrap_key" className={labelCls}>
              Bootstrap API Key
            </label>
            <Field
              id="bootstrap_key"
              name="bootstrap_key"
              type="text"
              placeholder="Paste FOR_API_KEY_CREATE_KEY from .env"
              className={inputCls}
            />
            <ErrorMessage name="bootstrap_key" component="p" className="text-red-500 text-xs mt-1" />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Used only for this creation request. Not stored anywhere.
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="create_name" className={labelCls}>Name</label>
            <Field
              id="create_name"
              name="name"
              type="text"
              placeholder="e.g. Production Key"
              className={inputCls}
            />
            <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
          </div>

          {/* Usage Limit */}
          <div>
            <label htmlFor="create_usage_limit" className={labelCls}>
              Usage Limit <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Field
              id="create_usage_limit"
              name="usage_limit"
              type="number"
              min="1"
              placeholder="e.g. 1000"
              className={inputCls}
            />
          </div>

          {/* Expires At */}
          <div>
            <label htmlFor="create_expires_at" className={labelCls}>
              Expires At <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Field id="create_expires_at" name="expires_at" type="date" className={inputCls} />
          </div>

          <div className="flex gap-3 pt-2">
            <MyButton type="submit" variant="primary" isLoading={isSubmitting}>
              Create API Key
            </MyButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ApiKeyForm;
