import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "navy"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  variant = "default",
  size = "sm",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-[color:var(--surface-sunken)] text-[color:var(--text-secondary)] border border-[color:var(--border-light)]",
    navy:
      "bg-[color:var(--primary-soft)] text-[color:var(--primary)] border border-[color:var(--primary-soft)]",
    info:
      "bg-[color:var(--primary-soft)] text-[color:var(--primary)] border border-[color:var(--primary-soft)]",
    accent:
      "bg-[color:var(--accent-soft)] text-[color:var(--accent-active)] border border-[color:var(--accent-soft)]",
    success:
      "bg-[color:var(--success-soft)] text-[color:var(--success)] border border-[color:var(--success-soft)]",
    warning:
      "bg-[color:var(--warning-soft)] text-[color:var(--warning)] border border-[color:var(--warning-soft)]",
    danger:
      "bg-[color:var(--danger-soft)] text-[color:var(--danger)] border border-[color:var(--danger-soft)]",
    neutral:
      "bg-[color:var(--surface-sunken)] text-[color:var(--text-secondary)] border border-[color:var(--border)]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
