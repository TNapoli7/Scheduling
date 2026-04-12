"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/activity-log";
import type { Notification } from "@/types/database";

interface HeaderProps {
  userName: string;
  unreadCount: number;
  onMenuClick: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function Header({ userName, unreadCount: initialUnread, onMenuClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setUnreadCount(initialUnread); }, [initialUnread]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data || []) as Notification[]);
    setLoadingNotifs(false);
  }, []);

  function toggleNotifications() {
    if (!showNotifications) fetchNotifications();
    setShowNotifications(!showNotifications);
    setShowDropdown(false);
  }

  async function markAsRead(notifId: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    const supabase = createClient();
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function handleSignOut() {
    logActivity("logout", "auth");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 h-14 bg-[color:var(--surface)]/80 backdrop-blur-md border-b border-[color:var(--border-light)]/60 px-4 lg:px-6">
      <div className="flex items-center justify-between h-full">
        {/* Left: mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--surface-sunken)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden" />

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] rounded-lg hover:bg-[color:var(--surface-sunken)] transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[color:var(--accent)] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[color:var(--surface)] rounded-2xl shadow-xl border border-[color:var(--border-light)]/60 z-50 max-h-[400px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border-light)]">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">Notificações</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[color:var(--accent)] hover:text-[color:var(--accent-active)] font-medium"
                    >
                      Marcar como lidas
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {loadingNotifs ? (
                    <div className="text-center py-8 text-[color:var(--text-muted)] text-sm">A carregar...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                      <p className="text-sm text-[color:var(--text-muted)]">Sem notificações</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-stone-50 hover:bg-[color:var(--surface-sunken)] cursor-pointer flex items-start gap-3 transition-colors ${
                          !notif.is_read ? "bg-[color:var(--accent-soft)]/40" : ""
                        }`}
                        onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.is_read ? "font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)]"}`}>
                            {notif.title}
                          </p>
                          {notif.body && (
                            <p className="text-xs text-[color:var(--text-muted)] mt-0.5 line-clamp-2">{notif.body}</p>
                          )}
                          <p className="text-[10px] text-stone-300 mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-[color:var(--accent-soft)]0 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[color:var(--surface-sunken)] transition-colors"
            >
              <div className="w-7 h-7 bg-[color:var(--accent-soft)] text-[color:var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-[color:var(--text-primary)]">{userName}</span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[color:var(--text-muted)]" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[color:var(--surface)] rounded-xl shadow-xl border border-[color:var(--border-light)]/60 py-1 z-50">
                <button
                  onClick={() => { setShowDropdown(false); router.push("/settings"); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-sunken)] transition-colors"
                >
                  <User className="w-4 h-4 text-[color:var(--text-muted)]" />
                  Perfil
                </button>
                <div className="border-t border-[color:var(--border-light)] my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
