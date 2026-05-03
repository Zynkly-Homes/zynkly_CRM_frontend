// //shaking
// import React, { useState, useRef, useEffect } from 'react';
// import { clsx } from 'clsx';

// interface OTPInputProps {
//   length?: number;
//   value?: string;
//   onChange?: (otp: string) => void;
//   error?: string;
// }

// export const OTPInput: React.FC<OTPInputProps> = ({
//   length = 6,
//   value = '',
//   onChange,
//   error,
// }) => {
//   const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (value) {
//       const arr = value.split('').concat(new Array(length).fill('')).slice(0, length);
//       setOtp(arr);
//     }
//   }, [value, length]);

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const pasted = e.clipboardData.getData("text").replace(/\D/g, "");

//     if (!pasted) return;

//     const sliced = pasted.slice(0, length).split("");
//     const newOtp = [...otp];

//     sliced.forEach((num, idx) => {
//       newOtp[idx] = num;
//     });

//     setOtp(newOtp);
//     onChange?.(newOtp.join(""));

//     const lastIndex = sliced.length - 1;
//     inputRefs.current[lastIndex]?.focus();
//   };

//   const handleChange = (index: number, val: string) => {
//     if (val.length > 1) return;

//     const newOtp = [...otp];
//     newOtp[index] = val;
//     setOtp(newOtp);

//     onChange?.(newOtp.join(""));

//     if (val && index < length - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="flex justify-center space-x-3 mb-3">
//         {Array.from({ length }).map((_, index) => (
//           <input
//             key={index}
//             ref={(el) => (inputRefs.current[index] = el)}
//             maxLength={1}
//             type="text"
//             inputMode="numeric"
//             value={otp[index]}
//             onPaste={handlePaste}
//             onChange={(e) => handleChange(index, e.target.value)}
//             onKeyDown={(e) => handleKeyDown(index, e)}
//             className={clsx(
//               "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-colors",
//               "focus:outline-none focus:ring-2 focus:ring-blue-500",
//               {
//                 "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white":
//                   !error,
//                 "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300":
//                   error,
//               }
//             )}
//           />
//         ))}
//       </div>

//       {/* Stable space for error — No UI jumping */}
//       <div className="min-h-[22px] text-center">
//         {error && (
//           <p className="text-sm text-red-500 dark:text-red-400">
//             {error}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };





import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (otp: string) => void;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (value) {
      const arr = value.split('').concat(new Array(length).fill('')).slice(0, length);
      setOtp(arr);
    }
  }, [value, length]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const sliced = pasted.slice(0, length).split("");
    const newOtp = [...otp];
    sliced.forEach((num, idx) => {
      newOtp[idx] = num;
    });

    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    const lastIndex = sliced.length - 1;
    inputRefs.current[lastIndex]?.focus();
  };

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-center space-x-4 mb-0">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            maxLength={1}
            type="text"
            inputMode="numeric"
            value={otp[index]}
            onPaste={handlePaste}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={clsx(
              "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-colors",
              "focus:outline-none ",
              {
                "border-gray-300  bg-white  text-gray-900 d":
                  !error,
                "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300":
                  error,
              }
            )}
          />
        ))}
      </div>

      <div className="min-h-[18px] text-center">
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};