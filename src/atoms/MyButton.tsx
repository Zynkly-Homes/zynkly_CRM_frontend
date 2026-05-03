import React from 'react';
import { clsx } from 'clsx';
import { Loader } from './Loader';

interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const MyButton: React.FC<MyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    className={clsx(
      'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-[var(--sc-primary)] text-white shadow-sm hover:bg-[var(--sc-primary-hover)] active:bg-[var(--sc-primary-active)]':
          variant === 'primary',
        'bg-gray-600 text-white shadow-sm hover:bg-gray-700 active:bg-gray-800':
          variant === 'secondary',
        'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800':
          variant === 'danger',
        'bg-green-600 text-white shadow-sm hover:bg-green-700 active:bg-green-800':
          variant === 'success',
        'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700':
          variant === 'warning',
        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent':
          variant === 'ghost',
        'border border-[var(--sc-primary)] text-[var(--sc-primary)] bg-transparent hover:bg-[var(--sc-primary)] hover:text-white dark:hover:bg-[var(--sc-primary-hover)]':
          variant === 'outline',
      },
      {
        'px-3 py-1.5 text-xs': size === 'sm',
        'px-4 py-2 text-sm':   size === 'md',
        'px-6 py-3 text-base': size === 'lg',
      },
      className
    )}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? (
      <Loader size="sm" className="mr-2 animate-spin" />
    ) : (
      leftIcon && <span className="mr-2">{leftIcon}</span>
    )}
    <span className={clsx({ 'opacity-70': isLoading })}>{children}</span>
    {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
  </button>
);
