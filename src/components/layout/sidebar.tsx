"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  Clock,
  X,
  CalendarOff,
  Palmtree,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { UserRole } from "@/types/database";
import { LanguageSelector } from "./language-selector";
import { useClientLocale } from "@/hooks/use-locale";
import { ShifteraLogo } from "@/components/lp/ShifteraLogo";

interface SidebarProps {
  role: UserRole;
  orgName: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ role, orgName, open, onClose }: SidebarProps) {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const locale = useClientLocale();

  const navigationItems = [
    { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
    { key: "schedule", href: "/schedule", icon: Calendar, roles: ["admin", "manager", "employee"] },
    { key: "employees", href: "/employees", icon: Users, roles: ["admin", "manager"] },
    { key: "shifts", href: "/shifts", icon: Clock, roles: ["admin", "manager"] },
    { key: "availability", href: "/availability", icon: CalendarOff, roles: ["admin", "manager", "employee"] },
    { key: "timeOff", href: "/time-off", icon: Palmtree, roles: ["admin", "manager", "employee"] },
    { key: "swaps", href: "/swaps", icon: ArrowLeftRight, roles: ["admin", "manager", "employee"] },
    { key: "fairness", href: "/fairness", icon: BarChart3, roles: ["admin", "manager"] },
    { key: "settings", href: "/settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNav = navigationItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-gradient-to-b from-[color:var(--primary)] via-[color:var(--primary)] to-[color:var(--primary-active)]
          shadow-[4px_0_32px_-8px_rgba(15,27,45,0.25)]
          lg:rounded-br-[28px]
          transform transition-[transform,width] duration-300 ease-in-out
          lg:sticky lg:top-0 lg:self-start lg:z-auto lg:translate-x-0
          flex flex-col shrink-0
          ${collapsed ? "lg:w-[76px]" : "lg:w-[248px]"}
          w-[248px]
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Subtle inner glow at top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.04] to-transparent" />

        {/* Logo / Org name */}
        <div className="relative flex items-center justify-between h-16 px-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShifteraLogo size={32} className="shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-display font-semibold text-white tracking-tight leading-tight">Shiftera</p>
                <p
                  className="text-[10px] text-[color:var(--sidebar-fg-muted)] truncate capitalize"
                  title={orgName}
                >
                  {orgName}
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-[color:var(--sidebar-fg-muted)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-3 pt-2 pb-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                title={collapsed ? t(item.key as any) : undefined}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150
                  ${collapsed ? "lg:justify-center lg:px-0" : ""}
                  ${isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-[color:var(--sidebar-fg-muted)] hover:bg-white/[0.04] hover:text-[color:var(--sidebar-fg)]"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[color:var(--accent)] rounded-r-full" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive
                      ? "text-[color:var(--accent)]"
                      : "text-[color:var(--sidebar-fg-muted)] group-hover:text-[color:var(--sidebar-fg)]"
                  }`}
                  strokeWidth={2}
                />
                <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{t(item.key as any)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: language selector, collapse toggle + branding */}
        <div className="relative shrink-0 border-t border-[color:var(--sidebar-border)] px-3 py-3 space-y-1">
          {/* Language selector */}
          <div className={`flex justify-center ${collapsed ? "lg:px-0" : ""}`}>
            <LanguageSelector currentLocale={locale} />
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`
              hidden lg:flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[12px] font-medium
              text-[color:var(--sidebar-fg-muted)] hover:bg-white/[0.04] hover:text-[color:var(--sidebar-fg)]
              transition-all duration-150
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? t('expand') : t('collapse')}
            aria-label={collapsed ? t('expand') : t('collapse')}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                <span>{t('collapse')}</span>
              </>
            )}
          </button>
          {!collapsed && (
            <div className="px-3 pt-1">
              <p className="text-[10px] text-[color:var(--sidebar-fg-muted)]/70 leading-tight">
                Shiftera
              </p>
              <p className="text-[10px] text-[color:var(--sidebar-fg-muted)]/40 leading-tight">v1.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
