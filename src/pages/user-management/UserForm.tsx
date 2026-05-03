//04-10-2025
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MyInput } from "../../atoms/MyInput";
import { MyButton } from "../../atoms/MyButton";
import { MyDropdown } from "../../atoms/MyDropdown";
import { showToastnew } from "../../services/toastifynewService/toastifynewService";
import { getData, postData, patchData } from "../../services/crmServices";

type RoleOption = { label: string; value: string };

type UserFormProps = {
  token?: string;
  initialValues?: {
    _id?: string;
    name: string;
    email: string;
    role_id: string;
    status?: "Active" | "Inactive" | null;
  };
  onSuccess: () => void;
};

const UserForm: React.FC<UserFormProps> = ({ token, initialValues, onSuccess }) => {
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = React.useState(true);

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    role_id: Yup.string().required("Role is required"),
  });

  const initialFormValues = {
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    role_id: initialValues?.role_id || "",
    status: initialValues?.status || "Password Not set",
  };

  const fetchRoles = React.useCallback(async () => {
    try {
      setLoadingRoles(true);
      
      const res = await getData<any>({
        endpoint: "role/getRolesList",
        token,
      });
      
      let rolesData: RoleOption[] = [];
      
      if (Array.isArray(res?.data)) {
        rolesData = res.data;
      } else if (Array.isArray(res)) {
        rolesData = res;
      } else if (res?.data && typeof res.data === 'object') {
        rolesData = Object.entries(res.data).map(([value, label]) => ({
          value,
          label: String(label)
        }));
      }
      
      setRoles(rolesData);
      
      if (rolesData.length === 0) {
        showToastnew.warning("No roles available");
      }
    } catch (e: any) {
      console.error("Error fetching roles:", e);
      setRoles([]);
      showToastnew.error(e?.data?.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const checkEmailUnique = async (email: string): Promise<string | null> => {
    if (!email || initialValues?._id) return null; // Skip check for existing users
    
    try {
      const res = await getData<{ status?: boolean; message?: string }>({
        endpoint: "crmAuth/checkEmail",
        token,
        params: { email },
      });
      
      if (res?.status && res?.message === "Email Already Exists") {
        return "User already exists with this email";
      }
      return null;
    } catch (e: any) {
      console.error("Email check error:", e);
      return "Failed to verify email";
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, setFieldError, resetForm }: any) => {
    try {
      // Check email uniqueness for new users
      if (!initialValues?._id) {
        const emailError = await checkEmailUnique(values.email);
        if (emailError) {
          setFieldError("email", emailError);
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        name: values.name.trim(),
        email: values.email.toLowerCase().trim(),
        role_id: values.role_id,
        status: values.status,
      };

      if (initialValues?._id) {
        await patchData({
          endpoint: "crmAuth/updateUser",
          token,
          params: { id: initialValues._id },
          data: payload,
        });
        showToastnew.success("User Saved Successfully");
      } else {
        await postData({
          endpoint: "crmAuth/createUser",
          token,
          data: payload,
        });
        showToastnew.success("User saved Successfully");
        resetForm();
      }
      
      onSuccess();
    } catch (e: any) {
      console.error("Submit error:", e);
      showToastnew.error(e?.data?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        setFieldValue,
        resetForm,
      }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MyInput
              label="Name"
              placeholder="Enter Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : ""}
              required
            />
            
            <MyInput
              label="Email"
              type="email"
              placeholder="Enter Email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ""}
              required
              disabled={!!initialValues?._id}
            />
            
            <MyDropdown
              label="Role"
              name="role_id"
              value={values.role_id}
              options={roles}
              onChange={(value) => setFieldValue("role_id", value)}
              placeholder={loadingRoles ? "Loading roles..." : "Select Role"}
              error={touched.role_id ? errors.role_id : ""}
              disabled={loadingRoles}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <MyButton 
              type="submit" 
              variant="primary" 
              isLoading={isSubmitting}
              disabled={loadingRoles}
            >
              {initialValues?._id ? "Update User" : "Create User"}
            </MyButton>
            
            <MyButton
              type="button"
              variant="outline"
              onClick={() => resetForm()}
              disabled={isSubmitting || loadingRoles}
            >
              Reset
            </MyButton>
          </div>

          {/* Debug info - remove in production */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <div>Debug Info:</div>
              <div>Roles loaded: {roles.length}</div>
              <div>Selected Role: {values.role_id}</div>
              <div>Loading Roles: {loadingRoles ? 'Yes' : 'No'}</div>
              <div>Available Roles: {roles.map(r => r.label).join(', ') || 'None'}</div>
            </div>
          )} */}
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;