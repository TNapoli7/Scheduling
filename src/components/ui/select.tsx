import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const baseField =
  "w-full rounded-[var(--radius-md)] bg-[color:var(--surface)] px-3.5 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] border border-[color:var(--border)] transition-colors hover:border-[color:var(--border-strong)] focus:outline-none focus-visible:outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary-soft)] disabled:bg-[color:var(--surface-sunken)] disabled:cursor-not-allowed disabled:text-[color:var(--text-muted)]";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${baseField} h-10 pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%235A6073%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${error ? "border-[color:var(--danger)] focus:border-[color:var(--danger)] focus:ring-[color:var(--danger-soft)]" : ""} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[color:var(--danger)] mt-1.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-[color:var(--text-muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
