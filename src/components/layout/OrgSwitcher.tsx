"use client";

/**
 * Organisation switcher for the dashboard sidebar.
 *
 * Shows the currently-active organisation with a dropdown to jump to any
 * other organisation the user is a member of. Includes a footer action to
 * create a brand-new organisation.
 *
 * Visually it replaces the plain logo + org-name block at the top of the
 * sidebar with a clickable chevron-trailing button.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { ShifteraLogo } from "@/components/lp/ShifteraLogo";
import { CreateOrgModal } from "./CreateOrgModal";

export interface OrgSwitcherItem {
  org_id: string;
  org_name: string;
  icon_url: string | null;
  role: "admin" | "manager" | "employee";
  /** The user's display name within this specific org (may differ between orgs). */
  full_name: string;
}

interface OrgSwitcherProps {
  /** All memberships the current user has (passed from the server layout). */
  memberships: OrgSwitcherItem[];
  /** The currently-active org id (profiles.active_org_id). */
  activeOrgId: string | null;
  /** Whether the sidebar is collapsed (icon-only). */
  collapsed?: boolean;
}

export function OrgSwitcher({ memberships, activeOrgId, collapsed }: OrgSwitcherProps) {
  const t = useTranslations("orgSwitcher");
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const active = memberships.find((m) => m.org_id === activeOrgId) ?? memberships[0];

  // Close on outside click / ESC
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function switchTo(orgId: string) {
    if (orgId === activeOrgId) {
      setOpen(false);
      return;
    }
    setSwitching(orgId);
    try {
      const res = await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId }),
      });
      if (res.ok) {
        // Full reload so RLS picks up the new org context everywhere.
        window.location.href = "/dashboard";
      } else {
        setSwitching(null);
      }
    } catch {
      setSwitching(null);
    }
  }

  function createNew() {
    // Open the CreateOrgModal inline instead of navigating to the onboarding
    // wizard. Authenticated admins don't need a multi-step flow — a single
    // compact form with sensible hour defaults is enough. The /onboarding
    // route remains dedicated to first-run users.
    setOpen(false);
    setCreateOpen(true);
  }

  if (!active) return null;

  return (
    <>
    <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} />
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04] transition ${
          collapsed ? "justify-center" : ""
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {active.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.icon_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <ShifteraLogo size={32} className="shrink-0" />
        )}
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              {/* Hierarchy: the ORG the user is currently in is the primary
                  line (bold, white, sm). The product name sits below as a
                  muted subtitle — it's context, not the important thing. */}
              <p
                className="text-sm font-semibold text-white tracking-tight leading-tight truncate capitalize"
                title={active.org_name}
              >
                {active.org_name}
              </p>
              <p className="text-[10px] font-normal text-[color:var(--sidebar-fg-muted)] leading-tight">
                Shiftera
              </p>
            </div>
            <ChevronsUpDown
              className="w-3.5 h-3.5 text-[color:var(--sidebar-fg-muted)] shrink-0"
              strokeWidth={2}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-white shadow-[0_12px_32px_-6px_rgba(0,0,0,0.25)] border border-stone-200 overflow-hidden"
          style={{ minWidth: "240px" }}
        >
          <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            {t("yourOrgs")}
          </div>
          {memberships.map((m) => {
            const isActive = m.org_id === activeOrgId;
            const loading = switching === m.org_id;
            return (
              <button
                key={m.org_id}
                role="option"
                aria-selected={isActive}
                onClick={() => switchTo(m.org_id)}
                disabled={!!switching}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                  isActive ? "bg-teal-50" : "hover:bg-stone-50"
                } ${switching && !loading ? "opacity-50" : ""}`}
              >
                {m.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.icon_url} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-[color:var(--accent-soft)] text-[color:var(--accent-active)] flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {(m.org_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 truncate capitalize">
                    {m.org_name}
                  </p>
                  <p className="text-[10px] text-stone-500 capitalize">
                    {t(`roles.${m.role}`)}
                  </p>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-[color:var(--accent)] shrink-0" />
                )}
              </button>
            );
          })}
          <button
            onClick={createNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 border-t border-stone-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-stone-600" />
            </div>
            {t("createNew")}
          </button>
        </div>
      )}
    </div>
    </>
  );
}
