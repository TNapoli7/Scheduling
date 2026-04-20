"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

export interface CurrentMembership {
  userId: string;
  orgId: string;
  role: UserRole;
  fullName: string;
  credential: string | null;
  contractType: string;
  weeklyHours: number;
  vacationQuota: number;
  isActive: boolean;
}

interface UseMembershipResult {
  membership: CurrentMembership | null;
  loading: boolean;
  isManager: boolean;
  /** Refresh from DB (e.g. after org switch) */
  refresh: () => Promise<void>;
}

/**
 * Resolves the current user's membership for their active org.
 *
 * This is the single source of truth for role + org context in client
 * components. It reads `active_org_id` from profiles, then fetches the
 * matching row in `memberships`.
 *
 * Previously, pages read `profiles.role` and `profiles.org_id` directly,
 * which broke when a user belonged to multiple orgs with different roles.
 */
export function useCurrentMembership(): UseMembershipResult {
  const [membership, setMembership] = useState<CurrentMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Get active_org_id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_org_id, org_id")
      .eq("id", user.id)
      .single();

    const orgId = profile?.active_org_id ?? profile?.org_id;
    if (!orgId) {
      setLoading(false);
      return;
    }

    // 2. Fetch membership for this org
    const { data: mem } = await supabase
      .from("memberships")
      .select(
        "user_id, org_id, role, full_name, credential, contract_type, weekly_hours, vacation_quota, is_active"
      )
      .eq("user_id", user.id)
      .eq("org_id", orgId)
      .eq("is_active", true)
      .single();

    if (mem) {
      setMembership({
        userId: mem.user_id,
        orgId: mem.org_id,
        role: mem.role as UserRole,
        fullName: mem.full_name,
        credential: mem.credential,
        contractType: mem.contract_type,
        weeklyHours: mem.weekly_hours,
        vacationQuota: mem.vacation_quota,
        isActive: mem.is_active,
      });
    } else {
      // Fallback: user may not have a membership yet (legacy data).
      // Read from profiles as last resort but log a warning.
      console.warn(
        "[useCurrentMembership] No membership found for org",
        orgId,
        "— falling back to profiles"
      );
      const { data: fallback } = await supabase
        .from("profiles")
        .select("id, org_id, role, full_name, credential, contract_type, weekly_hours, vacation_quota, is_active")
        .eq("id", user.id)
        .single();

      if (fallback) {
        setMembership({
          userId: fallback.id,
          orgId: orgId,
          role: (fallback.role ?? "employee") as UserRole,
          fullName: fallback.full_name ?? "",
          credential: fallback.credential ?? null,
          contractType: fallback.contract_type ?? "full_time",
          weeklyHours: fallback.weekly_hours ?? 40,
          vacationQuota: fallback.vacation_quota ?? 22,
          isActive: fallback.is_active ?? true,
        });
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isManager =
    membership?.role === "admin" || membership?.role === "manager";

  return { membership, loading, isManager, refresh: load };
}
