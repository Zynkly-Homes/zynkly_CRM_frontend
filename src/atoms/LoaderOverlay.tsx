import React from "react";
import { Loader } from "./Loader";

// Used only for full-page auth loading (login). Never for route navigation.
export const LoaderOverlay: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center pointer-events-none">
      <div className="relative">
        <Loader size="lg" />
      </div>
    </div>
  );
};
