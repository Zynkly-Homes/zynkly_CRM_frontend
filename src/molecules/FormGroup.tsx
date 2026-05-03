import React from 'react';
import { MyInput } from '../atoms/MyInput';
import { MyButton } from '../atoms/MyButton';

interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  children,
  actions,
}) => {
  return (
    // <div className="bg-[#e8eaec] dark:bg-gray-800   ">
       <div className="">
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {actions && (
        <div className="mt-6 flex justify-end space-x-4">
          {actions}
        </div>
      )}
    </div>
  );
};