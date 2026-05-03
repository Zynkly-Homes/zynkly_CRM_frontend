import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatters = {
  // Date formatters
  formatDate: (date: string | Date, formatStr = 'PPP'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid date';
      return format(dateObj, formatStr);
    } catch {
      return 'Invalid date';
    }
  },

  formatDateTime: (date: string | Date): string => {
    return formatters.formatDate(date, 'PPp');
  },

  formatTimeAgo: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid date';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  },

  // Number formatters
  formatNumber: (num: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  formatPercentage: (num: number, decimals = 1): string => {
    return formatters.formatNumber(num, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  formatCurrency: (num: number, currency = 'USD'): string => {
    return formatters.formatNumber(num, {
      style: 'currency',
      currency,
    });
  },

  formatCompactNumber: (num: number): string => {
    return formatters.formatNumber(num, {
      notation: 'compact',
      maximumFractionDigits: 1,
    });
  },

  // String formatters
  truncateText: (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  capitalizeFirst: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  capitalizeWords: (str: string): string => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // URL formatters
  formatUrl: (url: string): string => {
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  },

  getDomain: (url: string): string => {
    try {
      const urlObj = new URL(formatters.formatUrl(url));
      return urlObj.hostname;
    } catch {
      return url;
    }
  },

  // File size formatter
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // API key formatter
  formatApiKey: (key: string, visibleChars = 8): string => {
    if (key.length <= visibleChars * 2) return key;
    
    const start = key.substring(0, visibleChars);
    const end = key.substring(key.length - visibleChars);
    const middle = '*'.repeat(Math.min(key.length - visibleChars * 2, 12));
    
    return `${start}${middle}${end}`;
  },

  // Status formatter
  formatStatus: (status: string): string => {
    return status
      .split('_')
      .map(word => formatters.capitalizeFirst(word))
      .join(' ');
  },
};