type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-stone-100 text-stone-600 ring-stone-200/50",
  success: "bg-teal-50 text-teal-700 ring-teal-200/50",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/50",
  danger: "bg-red-50 text-red-700 ring-red-200/50",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-200/50",
};

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
