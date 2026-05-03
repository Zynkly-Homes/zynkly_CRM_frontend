import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Formik, Form as FormikForm } from "formik";
import * as yup from "yup";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../theme/colors";

const validationSchema = yup.object({
  emailOrMobile: yup.string().required("Email or Mobile is required"),
  password: yup.string().required("Password is required"),
});

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Formik
        initialValues={{ emailOrMobile: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload: any = { password: values.password };
            if (values.emailOrMobile.includes("@")) {
              payload.email = values.emailOrMobile;
            } else {
              payload.mobile = values.emailOrMobile;
            }
            await login(payload);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <FormikForm>

            {/* Email / Mobile */}
            <div style={{ marginBottom: "12px" }}>
              <input
                name="emailOrMobile"
                type="text"
                placeholder="Email or mobile number"
                value={values.emailOrMobile}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  borderRadius: "999px",
                  border: `1px solid ${touched.emailOrMobile && errors.emailOrMobile ? "#ff6b6b" : "rgba(255,255,255,0.15)"}`,
                  backgroundColor: "transparent",
                  color: "#e8e8e8",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = touched.emailOrMobile && errors.emailOrMobile ? "#ff6b6b" : "rgba(255,255,255,0.35)")}
                onBlurCapture={e => (e.target.style.borderColor = touched.emailOrMobile && errors.emailOrMobile ? "#ff6b6b" : "rgba(255,255,255,0.15)")}
              />
              {/* Fixed-height error slot — always rendered, never shifts layout */}
              <div style={{ height: "20px", paddingLeft: "16px", paddingTop: "3px" }}>
                {touched.emailOrMobile && errors.emailOrMobile && (
                  <span style={{ color: "#ff6b6b", fontSize: "12px" }}>
                    {errors.emailOrMobile}
                  </span>
                )}
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    padding: "15px 52px 15px 20px",
                    borderRadius: "999px",
                    border: `1px solid ${touched.password && errors.password ? "#ff6b6b" : "rgba(255,255,255,0.15)"}`,
                    backgroundColor: "transparent",
                    color: "#e8e8e8",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = touched.password && errors.password ? "#ff6b6b" : "rgba(255,255,255,0.35)")}
                  onBlurCapture={e => (e.target.style.borderColor = touched.password && errors.password ? "#ff6b6b" : "rgba(255,255,255,0.15)")}
                />
                {/* Eye icon always anchored to input — NOT affected by error div below */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.45)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Fixed-height error slot — always rendered, never shifts layout */}
              <div style={{ height: "20px", paddingLeft: "16px", paddingTop: "3px" }}>
                {touched.password && errors.password && (
                  <span style={{ color: "#ff6b6b", fontSize: "12px" }}>
                    {errors.password}
                  </span>
                )}
              </div>
            </div>

            {/* Consent text */}
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: "1.6", marginBottom: "16px" }}>
              By signing up or logging in, you consent to our{" "}
              <a href="#" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "underline" }}>
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "underline" }}>
                Privacy Policy
              </a>.
            </p>

            {/* Forgot password + Sign up row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4D7CFE", fontSize: "14px", padding: 0 }}
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4D7CFE", fontSize: "14px", padding: 0 }}
              >
                Sign up
              </button>
            </div>

            {/* Log in button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: isHovered && !(isLoading || isSubmitting)
                  ? COLORS.primary.hover
                  : COLORS.primary.DEFAULT,
                color: "#fff",
                fontSize: "16px",
                fontWeight: 500,
                cursor: isLoading || isSubmitting ? "not-allowed" : "pointer",
                opacity: isLoading || isSubmitting ? 0.65 : 1,
                marginBottom: "28px",
                letterSpacing: "0.1px",
                transition: "background-color 0.18s ease",
              }}
            >
              {isLoading || isSubmitting ? "Signing in…" : "Log in"}
            </button>

            {/* Social icons — lines + circular buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.12)" }} />

              <button
                type="button"
                style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  backgroundColor: "#222226", border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              </button>

              <button
                type="button"
                style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  backgroundColor: "#222226", border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                }}
              >
                <svg width="18" height="20" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.2 0 128.5 46.4 171.5 46.4 41.3 0 106-49 185.2-49 29.8 0 108.2 2.6 168.1 80.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
              </button>

              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.12)" }} />
            </div>

          </FormikForm>
        )}
      </Formik>
    </div>
  );
};