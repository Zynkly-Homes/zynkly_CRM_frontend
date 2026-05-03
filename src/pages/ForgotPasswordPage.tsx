//17-10=2025
// needsotp()
import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import * as yup from "yup";
import { MyInput } from "../atoms/MyInput";
import { MyButton } from "../atoms/MyButton";
import { FormGroup } from "../molecules/FormGroup";
import { AuthLayout } from "../templates/AuthLayout";
import { postData } from "../services/crmServices";
import { showToast, MyToaster } from "../atoms/MyToast";
import { Mail } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // NEW: import

const validationSchema = yup.object({
  email: yup.string().email("Invalid email address").required("Email is required"),
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearNeedsOTP } = useAuth(); // NEW: use clearNeedsOTP
  const initialValues = { email: "" };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      // matches your curl: POST /crmAuth/forgotPassword?email=...
      const res = await postData({
        endpoint: "crmAuth/forgotPassword",
        params: { email: values.email },
        data: {},
      });

      if (res?.status === 201 || res?.data?.status) {
        // NEW: clear any OTP state BEFORE redirecting to login
        clearNeedsOTP();
        showToast.success(res?.data?.message || "Email Sent Successfully");
        // dev: log link
        console.info("Password link (dev):", res?.data?.data?.passwordLink);
        setTimeout(() => navigate("/login"), 1400);
      } else {
        throw new Error(res?.data?.message || "Failed to send reset link");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <MyToaster />
      <div className="w-full max-w-[460px]">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-8 shadow-sm">
          <div className="mb-8 text-center md:text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-700 dark:text-white mb-2">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the email address you used when you joined, and we will send you a password reset link.
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, touched, errors, handleChange, handleBlur, isSubmitting }) => (
              <FormikForm>
                <FormGroup>
                  <MyInput
                    name="email"
                    type="email"
                    label="Enter Email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email ? errors.email : undefined}
                    leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  />

                  <div className="flex gap-3 mt-4">
                    <MyButton
                      type="submit"
                      className="flex-1 h-12"
                      isLoading={isSubmitting}
                    >
                      Send Link
                    </MyButton>

                    <MyButton
                      type="button"
                      variant="ghost"
                      className="h-12"
                      onClick={() => {
                        // NEW: clear OTP state if user navigates back manually
                        clearNeedsOTP();
                        navigate("/login");
                      }}
                    >
                      Back to login
                    </MyButton>
                  </div>
                </FormGroup>
              </FormikForm>
            )}
          </Formik>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
