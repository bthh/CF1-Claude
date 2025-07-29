/**
 * CSRF Protected Form Component
 * Automatically adds CSRF protection to forms
 */

import React, { forwardRef } from 'react';
import { useCSRFProtection } from '../../utils/csrfProtection';

interface CSRFProtectedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Form component with automatic CSRF protection
 */
const CSRFProtectedForm = forwardRef<HTMLFormElement, CSRFProtectedFormProps>(
  ({ children, onSubmit, ...props }, ref) => {
    const { getToken, addTokenToFormData } = useCSRFProtection();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      // Add CSRF token to form data if it's a FormData submission
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      // Add CSRF token to form data
      const protectedFormData = addTokenToFormData(formData);
      
      // Call original onSubmit if provided
      if (onSubmit) {
        onSubmit(event);
      }
    };

    return (
      <form {...props} ref={ref} onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input
          type="hidden"
          name="_csrf"
          value={getToken()}
          aria-hidden="true"
        />
        {children}
      </form>
    );
  }
);

CSRFProtectedForm.displayName = 'CSRFProtectedForm';

export default CSRFProtectedForm;