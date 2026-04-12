import { createClient } from "@/lib/supabase/client";

/**
 * Log a user activity (client-side).
 * Fire-and-forget — never blocks the UI or throws.
 */
export function logActivity(
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
) {
  const supabase = createClient();
  supabase
    .rpc("log_activity", {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId ?? null,
      p_details: details ?? {},
    })
    .then(({ error }) => {
      if (error) console.warn("[activity-log]", error.message);
    });
}
