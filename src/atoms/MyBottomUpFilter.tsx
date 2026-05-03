// import React, { useEffect, useRef } from 'react';
// import clsx from 'clsx';
// import { X, Filter } from 'lucide-react';
// import { COLORS } from '../theme/colors';
// import { MyButton } from './MyButton';
// import { MyInput } from './MyInput';

// export interface FilterOption {
//   value: string;
//   label: string;
//   count?: number;
// }

// export interface FilterSection {
//   id: string;
//   title: string;
//   type: 'checkbox' | 'radio' | 'range' | 'search';
//   options?: FilterOption[];
//   min?: number;
//   max?: number;
//   step?: number;
//   unit?: string;
//   placeholder?: string;
// }

// export interface MyBottomUpFilterProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   sections: FilterSection[];
//   selectedValues: Record<string, any>;
//   onFilterChange: (sectionId: string, value: any) => void;
//   onApply?: () => void;
//   onReset?: () => void;
//   showReset?: boolean;
//   showApply?: boolean;
//   applyLabel?: string;
//   resetLabel?: string;
//   maxHeight?: string;
//   showSearchInHeader?: boolean;
//   onSearchChange?: (value: string) => void;
//   searchPlaceholder?: string;
//   loading?: boolean;
// }

// export const MyBottomUpFilter: React.FC<MyBottomUpFilterProps> = ({
//   isOpen,
//   onClose,
//   title = 'Filters',
//   sections,
//   selectedValues,
//   onFilterChange,
//   onApply,
//   onReset,
//   showReset = true,
//   showApply = true,
//   applyLabel = 'Apply',
//   resetLabel = 'Reset',
//   maxHeight = '80vh',
//   showSearchInHeader = false,
//   onSearchChange,
//   searchPlaceholder = 'Search filters...',
//   loading = false,
// }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   const overlayRef = useRef<HTMLDivElement>(null);
//   const searchRef = useRef<HTMLInputElement>(null);

//   // Close on escape key
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isOpen) {
//         onClose();
//       }
//     };
//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [isOpen, onClose]);

//   // Prevent body scroll when open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//       // Focus search if exists
//       if (showSearchInHeader && searchRef.current) {
//         setTimeout(() => searchRef.current?.focus(), 100);
//       }
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, showSearchInHeader]);

//   // Handle overlay click
//   const handleOverlayClick = (e: React.MouseEvent) => {
//     if (e.target === overlayRef.current) {
//       onClose();
//     }
//   };

//   const renderFilterSection = (section: FilterSection) => {
//     const currentValue = selectedValues[section.id];

//     switch (section.type) {
//       case 'checkbox':
//         return (
//           <div className="space-y-3">
//             {section.options?.map((option) => {
//               const isChecked = Array.isArray(currentValue)
//                 ? currentValue.includes(option.value)
//                 : currentValue === option.value;

//               return (
//                 <label
//                   key={option.value}
//                   className="flex items-center justify-between cursor-pointer group"
//                 >
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       onChange={() => {
//                         if (Array.isArray(currentValue)) {
//                           const newValues = isChecked
//                             ? currentValue.filter(v => v !== option.value)
//                             : [...currentValue, option.value];
//                           onFilterChange(section.id, newValues);
//                         } else {
//                           onFilterChange(section.id, option.value);
//                         }
//                       }}
//                       className="h-4 w-4 rounded border-gray-300 text-[#26c9cb] focus:ring-[#26c9cb] focus:ring-offset-0"
//                     />
//                     <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
//                       {option.label}
//                     </span>
//                   </div>
//                   {option.count !== undefined && (
//                     <span className="text-xs text-gray-500 dark:text-gray-400">
//                       {option.count}
//                     </span>
//                   )}
//                 </label>
//               );
//             })}
//           </div>
//         );

//       case 'radio':
//         return (
//           <div className="space-y-3">
//             {section.options?.map((option) => (
//               <label
//                 key={option.value}
//                 className="flex items-center justify-between cursor-pointer"
//               >
//                 <div className="flex items-center">
//                   <input
//                     type="radio"
//                     name={section.id}
//                     value={option.value}
//                     checked={currentValue === option.value}
//                     onChange={(e) => onFilterChange(section.id, e.target.value)}
//                     className="h-4 w-4 border-gray-300 text-[#26c9cb] focus:ring-[#26c9cb] focus:ring-offset-0"
//                   />
//                   <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
//                     {option.label}
//                   </span>
//                 </div>
//                 {option.count !== undefined && (
//                   <span className="text-xs text-gray-500 dark:text-gray-400">
//                     {option.count}
//                   </span>
//                 )}
//               </label>
//             ))}
//           </div>
//         );

//       case 'range':
//         return (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 Min: {currentValue?.min || section.min}
//               </div>
//               <div className="text-sm text-gray-600 dark:text-gray-400">
//                 Max: {currentValue?.max || section.max}
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <MyInput
//                 type="number"
//                 value={currentValue?.min || section.min}
//                 onChange={(e) => {
//                   const newMin = parseInt(e.target.value) || section.min || 0;
//                   onFilterChange(section.id, {
//                     min: newMin,
//                     max: currentValue?.max || section.max,
//                   });
//                 }}
//                 min={section.min}
//                 max={currentValue?.max || section.max}
//                 className="w-24"
//                 variant="filled"
//               />
//               <span className="text-gray-400">to</span>
//               <MyInput
//                 type="number"
//                 value={currentValue?.max || section.max}
//                 onChange={(e) => {
//                   const newMax = parseInt(e.target.value) || section.max || 100;
//                   onFilterChange(section.id, {
//                     min: currentValue?.min || section.min,
//                     max: newMax,
//                   });
//                 }}
//                 min={currentValue?.min || section.min}
//                 max={section.max}
//                 className="w-24"
//                 variant="filled"
//               />
//               {section.unit && (
//                 <span className="text-sm text-gray-500">{section.unit}</span>
//               )}
//             </div>
//           </div>
//         );

//       case 'search':
//         return (
//           <MyInput
//             type="text"
//             placeholder={section.placeholder || 'Search...'}
//             value={currentValue || ''}
//             onChange={(e) => onFilterChange(section.id, e.target.value)}
//             variant="filled"
//             leftIcon={<Filter size={16} />}
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       {/* Overlay */}
//       <div
//         ref={overlayRef}
//         className={clsx(
//           'fixed inset-0 bg-black/50  transition-opacity duration-300 z-50',
//           isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         )}
//         onClick={handleOverlayClick}
//         aria-hidden="true"
//       />

//       {/* Modal */}
//       <div
//         ref={modalRef}
//         className={clsx(
//           'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out',
//           isOpen ? 'translate-y-0' : 'translate-y-full'
//         )}
//         style={{ maxHeight }}
//       >
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl px-4 pt-4 pb-3">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center">
//               <Filter className="h-5 w-5 text-[#26c9cb] mr-2" />
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 {title}
//               </h2>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//               aria-label="Close filters"
//             >
//               <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//             </button>
//           </div>

//           {showSearchInHeader && onSearchChange && (
//             <div className="mb-3">
//               <MyInput
//                 ref={searchRef}
//                 type="text"
//                 placeholder={searchPlaceholder}
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 variant="filled"
//                 className="w-full"
//               />
//             </div>
//           )}
//         </div>

//         {/* Filter Content */}
//         <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: `calc(${maxHeight} - 140px)` }}>
//           <div className="p-4 space-y-6">
//             {sections.map((section) => (
//               <div key={section.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
//                 <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
//                   {section.title}
//                 </h3>
//                 {renderFilterSection(section)}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
//           <div className="flex items-center justify-between space-x-3">
//             {showReset && (
//               <MyButton
//                 variant="outline"
//                 onClick={onReset}
//                 className="flex-1"
//                 disabled={loading}
//               >
//                 {resetLabel}
//               </MyButton>
//             )}
//             {showApply && (
//               <MyButton
//                 variant="primary"
//                 onClick={onApply}
//                 className="flex-1"
//                 isLoading={loading}
//               >
//                 {applyLabel}
//               </MyButton>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };



//v2 
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X, Filter } from 'lucide-react';
import { COLORS } from '../theme/colors';
import { MyButton } from './MyButton';
import { MyInput } from './MyInput';
import { MyDropdown } from "./MyDropdown";
import { DateRangePicker } from "../atoms/DateRangePicker2/DateRangePicker";
import {MultiSelectFilter} from './MultiSelectFilter'
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'search'| 'multi-select' | 'async-dropdown' | 'date-range';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  selectedValues?: string[];               // for multi-select
  singleSelect?: boolean;
  value?: any;                             // for dropdown / date
  onChange?: (value: any) => void;
  fetchOptions?: (page: number, limit: number, search: string) => Promise<any>;
  fetchSingle?: (id: string) => Promise<any>;
  // for date-range
  dateValue?: { from: Date | null; to: Date | null };
}

export interface MyBottomUpFilterProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sections: FilterSection[];
  selectedValues: Record<string, any>;
  onFilterChange: (sectionId: string, value: any) => void;
  onApply?: () => void;
  onReset?: () => void;
  showReset?: boolean;
  showApply?: boolean;
  applyLabel?: string;
  resetLabel?: string;
  maxHeight?: string;
  showSearchInHeader?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
}

export const MyBottomUpFilter: React.FC<MyBottomUpFilterProps> = ({
  isOpen,
  onClose,
  title = 'Filters',
  sections,
  selectedValues,
  onFilterChange,
  onApply,
  onReset,
  showReset = true,
  showApply = true,
  applyLabel = 'Apply',
  resetLabel = 'Reset',
  maxHeight = '80vh',
  showSearchInHeader = false,
  onSearchChange,
  searchPlaceholder = 'Search filters...',
  loading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus search if exists
      if (showSearchInHeader && searchRef.current) {
        setTimeout(() => searchRef.current?.focus(), 100);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showSearchInHeader]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const renderFilterSection = (section: FilterSection) => {
    const currentValue = selectedValues[section.id];

    switch (section.type) {
      case 'checkbox':
        return (
          <div className="space-y-3">
            {section.options?.map((option) => {
              const isChecked = Array.isArray(currentValue)
                ? currentValue.includes(option.value)
                : currentValue === option.value;

              return (
                <label
                  key={option.value}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center">
                    <MyInput
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (Array.isArray(currentValue)) {
                          const newValues = isChecked
                            ? currentValue.filter(v => v !== option.value)
                            : [...currentValue, option.value];
                          onFilterChange(section.id, newValues);
                        } else {
                          onFilterChange(section.id, option.value);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#26c9cb] focus:ring-[#26c9cb] focus:ring-offset-0"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {option.count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {section.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={section.id}
                    value={option.value}
                    checked={currentValue === option.value}
                    onChange={(e) => onFilterChange(section.id, e.target.value)}
                    className="h-4 w-4 border-gray-300 text-[#26c9cb] focus:ring-[#26c9cb] focus:ring-offset-0"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </div>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Min: {currentValue?.min || section.min}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Max: {currentValue?.max || section.max}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MyInput
                type="number"
                value={currentValue?.min || section.min}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value) || section.min || 0;
                  onFilterChange(section.id, {
                    min: newMin,
                    max: currentValue?.max || section.max,
                  });
                }}
                min={section.min}
                max={currentValue?.max || section.max}
                className="w-24"
                variant="filled"
              />
              <span className="text-gray-400">to</span>
              <MyInput
                type="number"
                value={currentValue?.max || section.max}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value) || section.max || 100;
                  onFilterChange(section.id, {
                    min: currentValue?.min || section.min,
                    max: newMax,
                  });
                }}
                min={currentValue?.min || section.min}
                max={section.max}
                className="w-24"
                variant="filled"
              />
              {section.unit && (
                <span className="text-sm text-gray-500">{section.unit}</span>
              )}
            </div>
          </div>
        );

      case 'search':
        return (
          <MyInput
            type="text"
            placeholder={section.placeholder || 'Search...'}
            value={currentValue || ''}
            onChange={(e) => onFilterChange(section.id, e.target.value)}
            variant="filled"
            leftIcon={<Filter size={16} />}
          />
        );
        case 'multi-select':
  return (
    <MultiSelectFilter
      options={section.options || []}
      selectedValues={section.selectedValues || []}
      onChange={(vals) => onFilterChange(section.id, vals)}
      placeholder={section.placeholder}
      singleSelect={section.singleSelect}
    />
  );

case 'async-dropdown':
  return (
    <MyDropdown
      value={section.value}
      onChange={(val) => onFilterChange(section.id, val)}
      placeholder={section.placeholder}
      fetchOptions={section.fetchOptions}
      fetchSingle={section.fetchSingle}
      required={false}
    />
  );

case 'date-range':
  return (
    <DateRangePicker
      value={section.dateValue || { from: null, to: null }}
      onChange={(newRange) => onFilterChange(section.id, newRange)}
      placeholder={section.placeholder || "Select date range..."}
      className="w-full"
    />
  );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={clsx(
          'fixed inset-0 bg-black/50  transition-opacity duration-300 z-50',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-[#26c9cb] mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close filters"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {showSearchInHeader && onSearchChange && (
            <div className="mb-3">
              <MyInput
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearchChange(e.target.value)}
                variant="filled"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: `calc(${maxHeight} - 140px)` }}>
          <div className="p-4 space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h3>
                {renderFilterSection(section)}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between space-x-3">
            {showReset && (
              <MyButton
                variant="outline"
                onClick={onReset}
                className="flex-1"
                disabled={loading}
              >
                {resetLabel}
              </MyButton>
            )}
            {showApply && (
              <MyButton
                variant="primary"
                onClick={onApply}
                className="flex-1"
                isLoading={loading}
              >
                {applyLabel}
              </MyButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
};