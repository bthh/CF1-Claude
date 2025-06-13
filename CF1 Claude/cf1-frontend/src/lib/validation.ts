import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  static validate(data: any, schema: ValidationSchema): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const ruleArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of ruleArray) {
        const error = this.validateField(field, value, rule);
        if (error) {
          errors.push(error);
          break; // Stop at first error for this field
        }
      }
    }

    return errors;
  }

  private static validateField(
    field: string,
    value: any,
    rule: ValidationRule
  ): ValidationError | null {
    // Required validation
    if (rule.required && !this.hasValue(value)) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} is required`,
      };
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && !this.hasValue(value)) {
      return null;
    }

    // Min/Max validation for numbers
    if (rule.min !== undefined && Number(value) < rule.min) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} must be at least ${rule.min}`,
      };
    }

    if (rule.max !== undefined && Number(value) > rule.max) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} must be at most ${rule.max}`,
      };
    }

    // Length validation for strings
    if (rule.minLength !== undefined && String(value).length < rule.minLength) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} must be at least ${rule.minLength} characters`,
      };
    }

    if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} must be at most ${rule.maxLength} characters`,
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return {
        field,
        message: rule.message || `${this.humanize(field)} is invalid`,
      };
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        return {
          field,
          message: typeof result === 'string' ? result : rule.message || `${this.humanize(field)} is invalid`,
        };
      }
    }

    return null;
  }

  private static hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '' && 
           !(Array.isArray(value) && value.length === 0);
  }

  private static humanize(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  url: /^https?:\/\/.+\..+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
  address: /^0x[a-fA-F0-9]{40}$/,
};

// Pre-built validation schemas
export const ValidationSchemas = {
  proposal: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    target_amount: {
      required: true,
      min: 1000,
      max: 10000000,
      custom: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num > 0 || 'Must be a positive number';
      },
    },
    token_price: {
      required: true,
      min: 0.01,
      custom: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num > 0 || 'Must be a positive number';
      },
    },
    funding_deadline: {
      required: true,
      custom: (value: any) => {
        const days = Number(value);
        return days >= 7 && days <= 120 || 'Must be between 7 and 120 days';
      },
    },
  },
  
  investment: {
    amount: {
      required: true,
      min: 1,
      custom: (value: any) => {
        const num = Number(value);
        return !isNaN(num) && num > 0 || 'Must be a positive number';
      },
    },
  },
  
  profile: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      pattern: ValidationPatterns.email,
      message: 'Please enter a valid email address',
    },
    phone: {
      pattern: ValidationPatterns.phone,
      message: 'Please enter a valid phone number',
    },
  },
};


export function useFormValidation<T extends Record<string, any>>(
  schema: ValidationSchema
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (field: string, value: any) => {
      const fieldRules = schema[field];
      if (!fieldRules) return;

      const validationErrors = Validator.validate({ [field]: value }, { [field]: fieldRules });
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (validationErrors.length > 0) {
          newErrors[field] = validationErrors[0].message;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    },
    [schema]
  );

  const validateForm = useCallback(
    (data: T): boolean => {
      const validationErrors = Validator.validate(data, schema);
      
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      
      setErrors(errorMap);
      
      // Mark all fields as touched
      const touchedMap: Record<string, boolean> = {};
      Object.keys(schema).forEach(field => {
        touchedMap[field] = true;
      });
      setTouched(touchedMap);
      
      return validationErrors.length === 0;
    },
    [schema]
  );

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return touched[field] ? errors[field] : undefined;
    },
    [errors, touched]
  );

  return {
    errors,
    touched,
    validateField,
    validateForm,
    markTouched,
    clearErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
}