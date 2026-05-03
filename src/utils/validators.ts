export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  password: (value: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value != null && value !== '';
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  numeric: (value: string): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value));
  },

  integer: (value: string): boolean => {
    return Number.isInteger(Number(value));
  },

  positiveInteger: (value: string): boolean => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  },

  businessId: (value: string): boolean => {
    // Business ID should be alphanumeric with underscores
    const businessIdRegex = /^[a-zA-Z0-9_]+$/;
    return businessIdRegex.test(value);
  },

  otp: (value: string): boolean => {
    // OTP should be 6 digits
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(value);
  },
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<{ rule: string; message: string; params?: any[] }>>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    for (const { rule, message, params = [] } of fieldRules) {
      let isValid = false;

      switch (rule) {
        case 'required':
          isValid = validators.required(value);
          break;
        case 'email':
          isValid = !value || validators.email(value);
          break;
        case 'password':
          isValid = !value || validators.password(value);
          break;
        case 'url':
          isValid = !value || validators.url(value);
          break;
        case 'minLength':
          isValid = !value || validators.minLength(value, params[0]);
          break;
        case 'maxLength':
          isValid = !value || validators.maxLength(value, params[0]);
          break;
        case 'numeric':
          isValid = !value || validators.numeric(value);
          break;
        case 'positiveInteger':
          isValid = !value || validators.positiveInteger(value);
          break;
        case 'businessId':
          isValid = !value || validators.businessId(value);
          break;
        case 'otp':
          isValid = !value || validators.otp(value);
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        errors[field] = message;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;




  
};




