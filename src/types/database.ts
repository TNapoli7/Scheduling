export type UserRole = "admin" | "manager" | "employee";
export type ContractType = "full_time" | "part_time";
export type ScheduleStatus = "draft" | "published" | "archived";
export type SwapStatus = "pending" | "approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type TimeOffType = "ferias" | "baixa" | "pessoal" | "outro";
export type TimeOffPeriod = "full_day" | "morning" | "afternoon";
export type Severity = "warning" | "block";
export type Preference = "preferred" | "neutral" | "avoid";
export type SubscriptionTier = "trial" | "starter" | "professional" | "business";
export type BillingCycle = "monthly" | "annual";

export interface Organization {
  id: string;
  name: string;
  sector: string;
  address: string | null;
  municipal_holiday: string | null;
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  trial_ends_at: string | null;
  plan_name: string;
  base_price: number;
  per_user_price: number;
  billing_cycle: BillingCycle;
  billing_notes: string | null;
  max_users: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgSummary extends Organization {
  active_users: number;
  total_users: number;
  last_org_login: string | null;
}

export interface Profile {
  id: string;
  org_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  credential: string | null;
  contract_type: ContractType;
  weekly_hours: number;
  is_active: boolean;
  avatar_url: string | null;
  vacation_quota: number;
  is_super_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftTemplate {
  id: string;
  org_id: string;
  name: string;
  start_time: string;
  end_time: string;
  min_staff: number;
  required_roles: { role: string; min: number }[];
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  org_id: string;
  month: number;
  year: number;
  status: ScheduleStatus;
  fairness_score: number | null;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEntry {
  id: string;
  schedule_id: string;
  user_id: string;
  date: string;
  shift_template_id: string;
  is_holiday: boolean;
  overtime_hours: number;
  notes: string | null;
  created_at: string;
  // Joined fields
  profile?: Profile;
  shift_template?: ShiftTemplate;
}

export interface Availability {
  id: string;
  user_id: string;
  date: string;
  available: boolean;
  preference: Preference;
  reason: string | null;
  approval_status: ApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  is_recurring: boolean;
  recurring_day: number | null;
  created_at: string;
  // Joined
  profile?: Profile;
}

export interface TimeOffRequest {
  id: string;
  user_id: string;
  org_id: string;
  start_date: string;
  end_date: string;
  type: TimeOffType;
  period: TimeOffPeriod;
  reason: string | null;
  status: ApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined
  profile?: Profile;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  target_id: string;
  entry_id: string;
  target_entry_id: string | null;
  status: SwapStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined
  requester?: Profile;
  target?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NationalHoliday {
  id: string;
  date: string;
  name: string;
  year: number;
}

export interface FairnessMetric {
  id: string;
  user_id: string;
  org_id: string;
  month: number;
  year: number;
  nights_count: number;
  weekends_count: number;
  holidays_count: number;
  total_hours: number;
  overtime_hours: number;
  fairness_score: number | null;
}
