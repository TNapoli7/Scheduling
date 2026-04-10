import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap";

    const variantStyles = {
      primary:
        "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-hover)] active:bg-[color:var(--primary-active)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
      accent:
        "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:bg-[color:var(--accent-hover)] active:bg-[color:var(--accent-active)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
      secondary:
        "bg-[color:var(--surface)] text-[color:var(--text-primary)] border border-[color:var(--border)] hover:bg-[color:var(--surface-sunken)] hover:border-[color:var(--border-strong)]",
      ghost:
        "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-sunken)] hover:text-[color:var(--text-primary)]",
      danger:
        "bg-[color:var(--danger)] text-white hover:brightness-110 shadow-[var(--shadow-sm)]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs h-8",
      md: "px-4 py-2 text-sm h-10",
      lg: "px-5 py-2.5 text-base h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
