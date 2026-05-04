import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { MyButton } from "../../atoms/MyButton";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { postData, patchData } from "../../services/crmServices";

// ---- Types ----

type ModuleFormProps = {
  token?: string;
  initialValues?: { _id?: string; module_id?: string; module_name?: string; is_active?: boolean };
  onSuccess: () => void;
};

type FormValues = {
  module_id: string;
  module_name: string;
  is_active: boolean;
};

// ---- Validation ----

const createSchema = Yup.object({
  module_id:   Yup.string().trim().required("Module ID is required")
    .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  module_name: Yup.string().trim().required("Module name is required"),
});

const editSchema = Yup.object({
  module_id:   Yup.string(),
  module_name: Yup.string().trim().required("Module name is required"),
  is_active:   Yup.boolean(),
});

// ---- Helpers ----

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { error?: { response?: { data?: { message?: string } } }; message?: string };
  return e?.error?.response?.data?.message ?? e?.message ?? "Operation failed";
}

// ---- Shared input style ----

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

// ---- Component ----

const ModuleForm: React.FC<ModuleFormProps> = ({ token, initialValues, onSuccess }) => {
  const isEdit = Boolean(initialValues?._id);

  const initial: FormValues = {
    module_id:   initialValues?.module_id   ?? "",
    module_name: initialValues?.module_name ?? "",
    is_active:   initialValues?.is_active   ?? true,
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }) => {
    try {
      if (isEdit) {
        await patchData({
          endpoint: `modules/${initialValues!._id}`,
          token,
          instance: "identity",
          data: { module_name: values.module_name.trim(), is_active: values.is_active },
        });
        showToastnew.success("Module updated successfully");
      } else {
        await postData({
          endpoint: "modules",
          token,
          instance: "identity",
          data: { module_id: values.module_id.trim(), module_name: values.module_name.trim() },
        });
        showToastnew.success("Module created successfully");
        resetForm();
      }
      onSuccess();
    } catch (err: unknown) {
      showToastnew.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initial}
      validationSchema={isEdit ? editSchema : createSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form autoComplete="off" className="space-y-4 max-w-lg">
          {/* Module ID — slug, editable only on create */}
          <div>
            <label htmlFor="module_id" className={labelCls}>
              Module ID <span className="text-gray-400 dark:text-gray-500 font-normal">(slug)</span>
            </label>
            <Field
              id="module_id"
              name="module_id"
              type="text"
              placeholder="e.g. user_management"
              disabled={isEdit}
              className={inputCls}
            />
            <ErrorMessage name="module_id" component="p" className="text-red-500 text-xs mt-1" />
            {!isEdit && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Lowercase letters, numbers, underscores only. Cannot be changed after creation.
              </p>
            )}
          </div>

          {/* Module Name */}
          <div>
            <label htmlFor="module_name" className={labelCls}>
              Module Name
            </label>
            <Field
              id="module_name"
              name="module_name"
              type="text"
              placeholder="e.g. User Management"
              className={inputCls}
            />
            <ErrorMessage name="module_name" component="p" className="text-red-500 text-xs mt-1" />
          </div>

          {/* is_active toggle — edit only */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={values.is_active}
                onClick={() => setFieldValue("is_active", !values.is_active)}
                className={[
                  "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  values.is_active
                    ? "bg-gray-700 dark:bg-gray-300"
                    : "bg-gray-300 dark:bg-gray-600",
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
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <MyButton type="submit" variant="primary" isLoading={isSubmitting}>
              {isEdit ? "Update Module" : "Create Module"}
            </MyButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ModuleForm;
