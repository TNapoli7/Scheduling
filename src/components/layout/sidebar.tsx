"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface SidebarProps {
  role: UserRole;
  orgName: string;
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
  { name: "Horário", href: "/schedule", icon: Calendar, roles: ["admin", "manager", "employee"] },
  { name: "Equipa", href: "/employees", icon: Users, roles: ["admin", "manager"] },
  { name: "Turnos", href: "/shifts", icon: Clock, roles: ["admin", "manager"] },
  { name: "Disponibilidades", href: "/availability", icon: CalendarOff, roles: ["admin", "manager", "employee"] },
  { name: "Férias", href: "/time-off", icon: Palmtree, roles: ["admin", "manager", "employee"] },
  { name: "Trocas", href: "/swaps", icon: ArrowLeftRight, roles: ["admin", "manager", "employee"] },
  { name: "Fairness", href: "/fairness", icon: BarChart3, roles: ["admin", "manager"] },
  { name: "Definições", href: "/settings", icon: Settings, roles: ["admin"] },
];

export function Sidebar({ role, orgName, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const filteredNav = navigation.filter((item) => item.roles.includes(role));

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
            <svg viewBox="0 0 96 106" className="w-8 h-9 shrink-0">
              <rect x="4" y="22" width="88" height="76" rx="10" ry="10" fill="#E8850A" />
              <rect x="4" y="22" width="88" height="26" rx="10" ry="10" fill="#D47608" />
              <rect x="4" y="38" width="88" height="10" fill="#D47608" />
              <rect x="26" y="10" width="8" height="22" rx="4" fill="#E8850A" />
              <rect x="62" y="10" width="8" height="22" rx="4" fill="#E8850A" />
              <circle cx="28" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="57" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="28" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="72" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="28" cy="87" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="48" cy="87" r="3" fill="#FFF" opacity="0.9" />
              <circle cx="68" cy="87" r="3" fill="#FFF" opacity="0.9" />
            </svg>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-display font-semibold text-white tracking-tight leading-tight">Shiftera</p>
                <p className="text-[10px] text-[color:var(--sidebar-fg-muted)] truncate">
                  {orgName}
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden text-[color:var(--sidebar-fg-muted)] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
            aria-label="Fechar menu"
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
                key={item.name}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
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
                <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: collapse toggle + branding */}
        <div className="relative shrink-0 border-t border-[color:var(--sidebar-border)] px-3 py-3 space-y-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`
              hidden lg:flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[12px] font-medium
              text-[color:var(--sidebar-fg-muted)] hover:bg-white/[0.04] hover:text-[color:var(--sidebar-fg)]
              transition-all duration-150
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                <span>Recolher</span>
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
