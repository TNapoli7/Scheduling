"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import type { UserRole } from "@/types/database";
import type { OrgSwitcherItem } from "./OrgSwitcher";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  orgName: string;
  userName: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  memberships: OrgSwitcherItem[];
  activeOrgId: string | null;
}

/**
 * Dashboard layout shell. We used to render a top `Header` band above the
 * main content with user menu + notifications, but that duplicated the
 * per-page H1 and cost ~56px of vertical real estate. Those controls now
 * live in the sidebar footer (see SidebarUserCluster); on mobile we only
 * keep a floating hamburger button to open the sidebar drawer.
 */
export function DashboardShell({
  children,
  role,
  orgName,
  userName,
  avatarUrl,
  unreadCount = 0,
  memberships,
  activeOrgId,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-textured flex">
      <Sidebar
        role={role}
        orgName={orgName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        memberships={memberships}
        activeOrgId={activeOrgId}
        userName={userName}
        unreadCount={unreadCount}
        avatarUrl={avatarUrl ?? null}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only floating hamburger — replaces the old top header for
            the sole purpose of opening the sidebar drawer on small screens. */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md border border-stone-200 text-stone-700 hover:text-stone-900"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* pb-24 reserves space for the floating chat bubble (~80px + margin)
             so the last row/card isn't covered on small viewports. */}
        <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
