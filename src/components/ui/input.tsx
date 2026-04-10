import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

const baseField =
  "w-full rounded-[var(--radius-md)] bg-[color:var(--surface)] px-3.5 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] border border-[color:var(--border)] transition-colors hover:border-[color:var(--border-strong)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary-soft)] disabled:bg-[color:var(--surface-sunken)] disabled:cursor-not-allowed disabled:text-[color:var(--text-muted)]";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseField} h-10 ${error ? "border-[color:var(--danger)] focus:border-[color:var(--danger)] focus:ring-[color:var(--danger-soft)]" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[color:var(--danger)] mt-1.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[color:var(--text-muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, rows = 4, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`${baseField} py-2.5 resize-y ${error ? "border-[color:var(--danger)] focus:border-[color:var(--danger)] focus:ring-[color:var(--danger-soft)]" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[color:var(--danger)] mt-1.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[color:var(--text-muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", id, children, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`${baseField} h-10 pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%235A6073%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${error ? "border-[color:var(--danger)] focus:border-[color:var(--danger)] focus:ring-[color:var(--danger-soft)]" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-xs text-[color:var(--danger)] mt-1.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[color:var(--text-muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
