"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-full mb-4"
        style={{
          backgroundColor: "var(--accent-soft)",
          color: "var(--accent)",
        }}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3
        className="text-base font-semibold mb-1 text-center"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-center max-w-sm mb-5"
        style={{ color: "var(--text-secondary)" }}
      >
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
