// src/atoms/LoaderOverlay.tsx
import React from "react";
import { Loader } from "./Loader";

export const LoaderOverlay: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center pointer-events-none">
      {/* subtle backdrop but keep clicks blocked? -> remove pointer-events-none if block karna ho */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      <div className="relative">
        <Loader size="lg" />
      </div>
    </div>
  );
};
