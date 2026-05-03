//v2
import React from "react";
import clsx from "clsx";
import { useFormikContext } from "formik";

export interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  // variant?: "default" | "filled";
  variant?: "default" | "filled" | "lightLabel";

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disableScrollOnNumber?: boolean;
  preventArrowIncrement?: boolean;
  preventNegative?: boolean;
}

export const MyInput: React.FC<MyInputProps> = ({
  label,
  error,
  variant = "default",
  leftIcon,
  rightIcon,
  className,
  disableScrollOnNumber = true,
  preventArrowIncrement = true,
  preventNegative = true,
  onWheel,
  onKeyDown,
  onChange,
  ...props
}) => {

  // ⭐ SAFE FORMIK CONTEXT — WILL NOT CRASH OUTSIDE FORMik
  let formik = null;

  try {
    formik = useFormikContext<any>();
  } catch {
    formik = null;
  }

  const setFieldValue = formik?.setFieldValue;
  const setFieldTouched = formik?.setFieldTouched;

  // 🔹 Prevent scroll in number fields
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (disableScrollOnNumber && props.type === "number") {
      e.currentTarget.blur();
      e.stopPropagation();
    }
    if (typeof onWheel === "function") onWheel(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.type === "number") {

      //  1) BLOCK e, E, +, -
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }

      //  2) Prevent Arrow Up/Down increment
      if (preventArrowIncrement && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
      }

      //  3) Prevent negative sign
      if (preventNegative && (e.key === "-" || e.key === "Subtract")) {
        e.preventDefault();
      }
    }

    // Call original event if passed
    if (typeof onKeyDown === "function") onKeyDown(e);
  };


  return (
    <div className="w-full">
      {label && (
        // <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <label
          className={clsx(
            "block text-sm mb-2",
            variant === "lightLabel"
              ? "font-normal text-gray-900 dark:text-gray-100"
              : "font-medium text-gray-900 dark:text-gray-100"
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          {...props}

          // ⭐ LIVE FORMIK VALIDATION + SAFE FALLBACK
          onChange={(e) => {
            if (setFieldValue && setFieldTouched && props.name) {
              setFieldValue(props.name, e.target.value);
              setFieldTouched(props.name, true, false);
            }

            // Normal input fallback
            if (typeof onChange === "function") onChange(e);
          }}

          onBlur={() => {
            if (setFieldTouched && props.name) {
              setFieldTouched(props.name, true);
            }
          }}

          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          min={preventNegative ? 0 : props.min}

          className={clsx(
            "w-full px-4 py-3 rounded-lg border transition-colors duration-150",
            // "focus:outline-none focus:ring-2 focus:ring-[#26c9cb]/30 focus:border-transparent",
            "focus:outline-none focus:ring-0 focus:border-gray-600 dark:focus:border-gray-600",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            // variant === "default" &&
            // !error &&
            // "border-gray-200 dark:border-gray-700 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-gray-900 dark:text-white",
            (variant === "default" || variant === "lightLabel") &&
            !error &&
            "border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white",

            variant === "filled" &&
            "bg-gray-50 dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-700",
            error && "border-red-400 bg-red-50 dark:bg-red-900/10 text-red-600",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
