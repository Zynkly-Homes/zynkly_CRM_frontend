import React from "react";
import clsx from "clsx";

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageCard: React.FC<PageCardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900   finbros-gradient dark:bg-gray-900 dark:bg-none",

        className
      )}
    >
      {children}
    </div>
  );
};
