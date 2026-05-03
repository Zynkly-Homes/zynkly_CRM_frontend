
import React, { useEffect, useState } from "react";
import { Shield, ArrowLeft, RotateCcw } from "lucide-react";
import { MyButton } from "../atoms/MyButton";
import { FormGroup } from "../molecules/FormGroup";
import { OTPInput } from "../molecules/OTPInput";
import { useAuth } from "../hooks/useAuth";
// import { showToast } from "../atoms/MyToast";
import { showToastnew } from "../../src/services/toastifynewService/toastifynewService";

interface OTPFormProps {
  email: string;
  userId: string;           //
  onBack: () => void;
}

export const OTPForm: React.FC<OTPFormProps> = ({ email, userId, onBack }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, resendOTP, isLoading } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }
    try {
      setError("");
      await verifyOTP({ user_id: userId, otp });  // 
      // success path handled in context (navigate + toast)
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid OTP";
      setError(msg);
      // showToast.error(msg);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ user_id: userId }); // 
      setCountdown(30);
      setCanResend(false);

    } catch {
      showToastnew.error("Failed to resend OTP");
    }
  };

  return (

    <main className="flex-1 flex items-center justify-center px-4  pb-12">
      <div className="w-full max-w-md">
        <div className="space-y-5 mb-6">
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 ">Verify OTP</h2>
          <p className="text-gray-600">
            Enter the verification code we just sent on <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
  <FormGroup>
            {/* <OTPInput value={otp} onChange={setOtp} error={error} /> */}
            <div className={`${error ? "shake-error" : ""} mb-4`}>
              <OTPInput value={otp} onChange={setOtp} error={error} />
            </div>

            <MyButton
              type="submit"
              className="w-full h-12" // same height and width as login button
              isLoading={isLoading}
              disabled={otp.length !== 6}
            >
              Verify OTP
            </MyButton>

            {/* <div className="flex items-center justify-between text-sm mt-2">
            <MyButton
              type="button"
              variant="ghost"
              onClick={onBack}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Login
            </MyButton>

            {canResend ? (
              <MyButton
                type="button"
                variant="ghost"
                onClick={handleResend}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Resend OTP
              </MyButton>
            ) : (
              <span className="text-gray-500">
                Resend in {countdown}s
              </span>
            )}
          </div> */}
            <div className="flex items-center justify-between text-sm mt-2">
              {/* Back to Login */}
              <span
                onClick={onBack}
                className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </span>

              {/* Resend Section */}
              {canResend ? (
                <span
                  onClick={handleResend}
                  className="text-green-500 font-medium cursor-pointer hover:underline"
                >
                  Resend OTP
                </span>
              ) : (
                <span className="text-gray-500">
                  Resend in {countdown}s
                </span>
              )}
            </div>

          </FormGroup>
          </div>
        
        </form>

      </div>
    </main>
  );
};
