"use client";

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
  { name: "Horario", href: "/schedule", icon: Calendar, roles: ["admin", "manager", "employee"] },
  { name: "Equipa", href: "/employees", icon: Users, roles: ["admin", "manager"] },
  { name: "Turnos", href: "/shifts", icon: Clock, roles: ["admin", "manager"] },
  { name: "Disponibilidades", href: "/availability", icon: CalendarOff, roles: ["admin", "manager", "employee"] },
  { name: "Ferias", href: "/time-off", icon: Palmtree, roles: ["admin", "manager", "employee"] },
  { name: "Trocas", href: "/swaps", icon: ArrowLeftRight, roles: ["admin", "manager", "employee"] },
  { name: "Fairness", href: "/fairness", icon: BarChart3, roles: ["admin", "manager"] },
  { name: "Definicoes", href: "/settings", icon: Settings, roles: ["admin"] },
];

export function Sidebar({ role, orgName, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[240px] bg-[color:var(--primary)]
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / Org name */}
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[color:var(--sidebar-active-bg)] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-white tracking-tight">Mapa</p>
              <p className="text-[10px] text-[color:var(--sidebar-fg-muted)] truncate max-w-[130px]">{orgName}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-[color:var(--sidebar-fg-muted)] hover:text-[color:var(--sidebar-fg)] p-1 rounded-lg hover:bg-[color:var(--primary-hover)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 px-3 space-y-0.5">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-[color:var(--sidebar-active-bg)]/20 text-[color:var(--sidebar-active-fg)]"
                    : "text-[color:var(--sidebar-fg-muted)] hover:bg-[color:var(--primary-hover)] hover:text-[color:var(--sidebar-fg)]"
                  }
                `}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-[color:var(--sidebar-active-fg)]" : "text-[color:var(--sidebar-fg-muted)]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-[color:var(--sidebar-border)]">
          <p className="text-[10px] text-stone-600">Mapa de Horario</p>
          <p className="text-[10px] text-stone-700">v1.0</p>
        </div>
      </aside>
    </>
  );
}
