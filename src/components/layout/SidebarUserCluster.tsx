"use client";

/**
 * SidebarUserCluster — user profile menu + notifications bell rendered at
 * the bottom of the sidebar.
 *
 * Why this lives in the sidebar and not a top header: the top header was
 * taking ~56px of vertical real estate on every single page to show a page
 * title that is already rendered big in each page's H1, plus user + bell.
 * Moving user/bell into the sidebar (where all other navigation already
 * lives) lets us kill the header entirely on desktop.
 *
 * Popovers open to the RIGHT of the sidebar so they don't get clipped,
 * even when the sidebar is collapsed to its 76px icon rail.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import type { Notification } from "@/types/database";

interface Props {
  userName: string;
  unreadCount: number;
  collapsed: boolean;
}

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("timeAgo.now");
  if (mins < 60) return `${mins} ${t("timeAgo.min")}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t("timeAgo.hour")}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t("timeAgo.day")}`;
}

export function SidebarUserCluster({ userName, unreadCount: initialUnread, collapsed }: Props) {
  const t = useTranslations("header");
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUnreadCount(initialUnread); }, [initialUnread]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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

  function toggleNotifs() {
    if (!showNotifs) fetchNotifications();
    setShowNotifs((v) => !v);
    setShowUserMenu(false);
  }

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
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

  async function signOut() {
    logActivity("logout", "auth");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-1">
      {/* User row */}
      <div ref={userRef} className="relative">
        <button
          type="button"
          onClick={() => { setShowUserMenu((v) => !v); setShowNotifs(false); }}
          title={collapsed ? userName : undefined}
          className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.05] transition ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent)] flex items-center justify-center text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <span className="text-[13px] font-medium text-white truncate min-w-0 flex-1 text-left">
              {userName}
            </span>
          )}
          {!collapsed && unreadCount > 0 && (
            <span className="text-[10px] text-[color:var(--sidebar-fg-muted)]">·</span>
          )}
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 lg:left-auto lg:right-auto lg:bottom-auto lg:top-0 lg:ml-[calc(100%+8px)] w-56 bg-white rounded-xl shadow-[0_12px_32px_-6px_rgba(0,0,0,0.25)] border border-stone-200 py-1 z-50">
            <div className="px-4 py-2.5 border-b border-stone-100">
              <p className="text-xs text-stone-500">{t("profile")}</p>
              <p className="text-sm font-medium text-stone-900 truncate">{userName}</p>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              <User className="w-4 h-4 text-stone-400" />
              {t("profile")}
            </button>
            <div className="border-t border-stone-100 my-1" />
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)]"
            >
              <LogOut className="w-4 h-4" />
              {t("signOut")}
            </button>
          </div>
        )}
      </div>

      {/* Notifications row */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={toggleNotifs}
          title={collapsed ? t("notifications") : undefined}
          className={`w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.05] transition text-[color:var(--sidebar-fg-muted)] hover:text-white ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
          aria-label={t("notifications")}
        >
          <div className="relative shrink-0 w-7 h-7 flex items-center justify-center">
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[color:var(--accent)] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[color:var(--primary)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[13px] font-medium truncate min-w-0 flex-1 text-left">
              {t("notifications")}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute bottom-full mb-2 left-0 right-0 lg:left-auto lg:right-auto lg:bottom-auto lg:top-0 lg:ml-[calc(100%+8px)] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_12px_32px_-6px_rgba(0,0,0,0.25)] border border-stone-200 z-50 max-h-[440px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-900">{t("notifications")}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[color:var(--accent)] hover:text-[color:var(--accent-active)] font-medium"
                >
                  {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingNotifs ? (
                <div className="text-center py-8 text-stone-500 text-sm">{t("loadingNotifs")}</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">{t("noNotifications")}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-stone-50 hover:bg-stone-50 cursor-pointer flex items-start gap-3 ${
                      !notif.is_read ? "bg-[color:var(--accent-soft)]/40" : ""
                    }`}
                    onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.is_read ? "font-semibold text-stone-900" : "text-stone-700"}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{notif.body}</p>
                      )}
                      <p className="text-[10px] text-stone-400 mt-1">{timeAgo(notif.created_at, t)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-[color:var(--accent)] rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
