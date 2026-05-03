
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export interface DropdownOption {
  label: string;
  value: string | null;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MyPaginationDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  // variant?: "default" | "filled";
  variant?: "default" | "filled" | "lightLabel";

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  // Add static options prop
  options?: DropdownOption[];
  // API props (optional for static dropdowns)
  fetchOptions?: (page: number, limit: number, search?: string) => Promise<{
    options: DropdownOption[];
    pagination: PaginationInfo;
  }>;
  fetchSingle?: (value: string) => Promise<DropdownOption | null>; // New prop for fetching a single item by value (ID)
  debounceDelay?: number;
  initialLimit?: number;
  showClear?: boolean; //new
}

export const MyDropdown: React.FC<MyPaginationDropdownProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  disabled = false,
  required = false,
  name,
  variant = "default",
  leftIcon,
  rightIcon,
  className,
  options: staticOptions, // Renamed to avoid confusion with state
  fetchOptions,
  fetchSingle,
  debounceDelay = 300,
  initialLimit = 20,

  showClear = true, // DEFAULT TRUE
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dynamicOptions, setDynamicOptions] = useState<DropdownOption[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [preFetchedOption, setPreFetchedOption] = useState<DropdownOption | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const currentPageRef = useRef(1);

  // Use static options if provided, otherwise use dynamic options
  const options = staticOptions || dynamicOptions;
  const selectedOption = options.find(opt => opt.value === value) || preFetchedOption;

  // Fetch single option if value is set but not in options (for dynamic dropdowns)
  useEffect(() => {
    const loadSelected = async () => {
      if (value && fetchSingle && !selectedOption && !staticOptions && !loading) {
        try {
          setLoading(true);
          const opt = await fetchSingle(value);
          if (opt) {
            setPreFetchedOption(opt);
            // Optionally add to dynamicOptions to avoid re-fetching later
            setDynamicOptions(prev => [opt, ...prev.filter(o => o.value !== opt.value)]);
          }
        } catch (error) {
          console.error("Error fetching single option:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSelected();
  }, [value, fetchSingle, staticOptions]); // Removed selectedOption and loading from dependencies to prevent loops

  // Fetch options with pagination and search (only for dynamic dropdowns)
  const fetchData = useCallback(
    async (page: number, search: string = "", isLoadMore: boolean = false) => {
      // Skip if static options are provided or dropdown is closed
      if (staticOptions || !isOpen || (loading && !isLoadMore) || (loadingMore && isLoadMore)) return;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const { options: newOptions, pagination: newPagination } = await fetchOptions!(
          page,
          initialLimit,
          search
        );

        if (isLoadMore) {
          setDynamicOptions(prev => [...prev, ...newOptions]);
        } else {
          setDynamicOptions(newOptions);
        }

        setPagination(newPagination);
        setHasMore(page < newPagination.totalPages);
        currentPageRef.current = page;

        if (!hasLoadedOnce) {
          setHasLoadedOnce(true);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchOptions, initialLimit, isOpen, hasLoadedOnce, staticOptions]
  );

  // Initial data fetch when dropdown opens (only for dynamic dropdowns)
  useEffect(() => {
    if (staticOptions || !isOpen || hasLoadedOnce || loading) return;
    console.log("Initial load triggered");
    fetchData(1, "");
  }, [isOpen, hasLoadedOnce, fetchData, staticOptions, loading]);

  // Handle search with debounce (only for dynamic dropdowns)
  useEffect(() => {
    if (staticOptions || !isOpen) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      currentPageRef.current = 1;
      fetchData(1, searchTerm);
    }, debounceDelay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, isOpen, fetchData, debounceDelay, staticOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset data when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle scroll for infinite loading (only for dynamic dropdowns)
  const handleScroll = useCallback(() => {
    if (staticOptions || !optionsContainerRef.current || loadingMore || !hasMore || loading) return;

    const container = optionsContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      const nextPage = currentPageRef.current + 1;
      console.log("Scroll load triggered - Page:", nextPage);
      fetchData(nextPage, searchTerm, true);
    }
  }, [loadingMore, hasMore, searchTerm, fetchData, loading, staticOptions]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    setHighlightedIndex(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    // onChange(null as any); 
    setSearchTerm("");
  };


  const clearSearch = () => {
    setSearchTerm("");
    if (isOpen && !staticOptions) {
      currentPageRef.current = 1;
      fetchData(1, "");
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )} */}
      {label && (
  <label
    className={clsx(
      "block text-sm mb-2",
      variant === "lightLabel"
        ? "font-normal text-gray-900 dark:text-gray-100"
        : "font-medium text-gray-700 dark:text-gray-300"
    )}
  >
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
)}


      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleToggle}
          className={clsx(
            "w-full px-4 py-3 rounded-lg border transition-colors duration-150 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-[#26c9cb]/30 focus:border-[#26c9cb] ",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            // variant === "default" &&
            // !error &&
            // "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
            (variant === "default" || variant === "lightLabel") &&
!error &&
"border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white",

            variant === "filled" &&
            "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
            error && "border-red-400 bg-red-50 dark:bg-red-900/10 text-red-600",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center justify-between">

            {/* <span
              className={clsx(
                selectedOption
                  ? "text-gray-900 dark:text-white"   //  FIXED
                  : "text-gray-400 dark:text-gray-500"
              )}
            >

              {selectedOption ? selectedOption.label : placeholder}
            </span> */}
            <span
              className={clsx(
                "block truncate",                  // ⭐ IMPORTANT
                selectedOption
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              )}
              title={selectedOption?.label}        // hover pe full text
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <div className="flex items-center gap-1">
              {/* CLEAR BUTTON - SAME AS MULTISELECTFILTER */}
              {/* {value && !disabled && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )} */}

              {showClear && value && !disabled && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}


              {/* CHEVRON DOWN - ONLY SHOW WHEN NO VALUE SELECTED OR ALWAYS SHOW */}
              <ChevronDown
                className={clsx(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>
        </div>

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Show search input only for dynamic dropdowns */}
            {!staticOptions && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#26c9cb] text-gray-900 dark:text-white"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  )}
                  {loading && !loadingMore && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
              </div>
            )}

            <div
              ref={optionsContainerRef}
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              {loading && dynamicOptions.length === 0 && !staticOptions ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading options...</span>
                </div>
              ) : options.length === 0 && !loading ? (
                <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchTerm && !staticOptions ? "No options found for your search" : "No options available"}
                </div>
              ) : (
                <>
                  {options.map((option, index) => (
                    <div
                      key={`${option.value}-${index}`}
                      onClick={() => handleSelect(option.value)}
                      className={clsx(
                        "px-4 py-3 cursor-pointer transition-colors text-sm",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "text-gray-900 dark:text-gray-100", //  Add consistent text colors
                        option.value === value && "bg-[#26c9cb]/10 text-[#26c9cb] dark:text-[#26c9cb]",
                        index === highlightedIndex && "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      )}
                    >
                      {option.label}
                    </div>
                  ))}
                  {loadingMore && !staticOptions && (
                    <div className="flex justify-center items-center py-3">
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Loading more options...</span>
                    </div>
                  )}
                  {!hasMore && dynamicOptions.length > 0 && !staticOptions && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center border-t dark:border-gray-700">
                      No more options to load
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
export default MyDropdown;