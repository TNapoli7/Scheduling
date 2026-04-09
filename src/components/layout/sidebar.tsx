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
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / Org name */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div>
            <p className="text-lg font-bold text-blue-600">Mapa</p>
            <p className="text-xs text-gray-500 truncate">{orgName}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
