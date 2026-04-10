"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import type { UserRole } from "@/types/database";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  orgName: string;
  userName: string;
  unreadCount?: number;
}

export function DashboardShell({
  children,
  role,
  orgName,
  userName,
  unreadCount = 0,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-textured flex">
      <Sidebar
        role={role}
        orgName={orgName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={userName}
          unreadCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
