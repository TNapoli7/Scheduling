import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg" | "none";
  variant?: "default" | "raised" | "ghost" | "outlined";
}

export function Card({
  padding = "md",
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6 lg:p-7",
  };
  const variantStyles = {
    default:
      "bg-[color:var(--surface)] border border-[color:var(--border-light)] shadow-[var(--shadow-xs)]",
    raised:
      "bg-[color:var(--surface)] border border-[color:var(--border-light)] shadow-[var(--shadow-md)]",
    ghost:
      "bg-[color:var(--surface-sunken)] border border-[color:var(--border-light)]",
    outlined:
      "bg-[color:var(--surface)] border border-[color:var(--border)]",
  };
  return (
    <div
      className={`rounded-[var(--radius-lg)] ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-semibold text-[color:var(--text-primary)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-[color:var(--text-secondary)] mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
