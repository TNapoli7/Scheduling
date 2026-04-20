"use client";

/**
 * /profile — personal info page.
 *
 * Distinct from /settings (which is the ORGANISATION-level settings page).
 * This is the user's own identity: full name, date of birth, gender,
 * avatar. Plus a password-change block that hits Supabase auth directly.
 *
 * Why a separate route: clicking "Perfil" in the sidebar user dropdown used
 * to land on /settings, where every field was org-scoped (org name, sector,
 * hours…) — confusing. Personal info belongs to the user, not the org.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("profile");

  const genderOptions = [
    { value: "", label: t("genderNotSpecified") },
    { value: "female", label: t("genderFemale") },
    { value: "male", label: t("genderMale") },
    { value: "non_binary", label: t("genderNonBinary") },
    { value: "other", label: t("genderOther") },
  ];

  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state (separate block so validation doesn't couple with
  // the personal-info save)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);
    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("full_name, date_of_birth, gender, avatar_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setDateOfBirth(data.date_of_birth || "");
      setGender(data.gender || "");
      setAvatarUrl(data.avatar_url || null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveProfile() {
    setSaving(true);
    setProfileMsg(null);

    if (!fullName.trim()) {
      setProfileMsg({ type: "error", text: t("nameRequired") });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
      })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      setProfileMsg({ type: "error", text: error.message });
      return;
    }

    logActivity("profile_updated", "profile");
    setProfileMsg({ type: "success", text: t("profileUpdated") });
    setTimeout(() => setProfileMsg(null), 3500);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Size + type guard — storage is public-read, a bad upload is visible
    // to everyone in the team, so reject obviously-wrong files up front.
    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "error", text: t("fileNotImage") });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: t("imageMaxSize") });
      return;
    }

    setUploading(true);
    setProfileMsg(null);

    // Path follows `<user_id>/avatar.<ext>` — the storage RLS policy checks
    // the first folder segment equals the caller's uid.
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setUploading(false);
      setProfileMsg({ type: "error", text: upErr.message });
      return;
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", userId);

    setUploading(false);
    if (updateErr) {
      setProfileMsg({ type: "error", text: updateErr.message });
      return;
    }

    setAvatarUrl(url);
    logActivity("profile_avatar_updated", "profile");
    setProfileMsg({ type: "success", text: t("avatarUpdated") });
    setTimeout(() => setProfileMsg(null), 3500);
  }

  async function removeAvatar() {
    if (!avatarUrl) return;
    setUploading(true);

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setAvatarUrl(null);
    setUploading(false);
    setProfileMsg({ type: "success", text: t("avatarRemoved") });
    setTimeout(() => setProfileMsg(null), 3500);
  }

  async function changePassword() {
    setPwdMsg(null);
    if (newPassword.length < 8) {
      setPwdMsg({ type: "error", text: t("passwordMinLength") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: t("passwordMismatch") });
      return;
    }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) {
      setPwdMsg({ type: "error", text: error.message });
      return;
    }
    logActivity("password_changed", "auth");
    setNewPassword("");
    setConfirmPassword("");
    setPwdMsg({ type: "success", text: t("passwordChanged") });
    setTimeout(() => setPwdMsg(null), 3500);
  }

  const initial = (fullName || email).charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)] font-display tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-[color:var(--text-muted)] mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Personal info */}
      <Card padding="lg">
        <div className="space-y-6">
          {/* Avatar block */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[color:var(--accent-soft)] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[color:var(--accent)]">{initial}</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 mr-1.5" />
                  {avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    {t("removePhoto")}
                  </Button>
                )}
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">
                {t("photoHint")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          <div className="border-t border-[color:var(--border-light)]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("fullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label={t("email")}
              value={email}
              disabled
              hint={t("emailChangeHint")}
            />
            <Input
              label={t("dateOfBirth")}
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <Select
              label={t("gender")}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={genderOptions}
            />
          </div>

          {profileMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-lg inline-flex items-center gap-1.5 ${
                profileMsg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileMsg.type === "success" && <Check className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={saveProfile} loading={saving}>
              {t("saveChanges")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Password change */}
      <Card padding="lg">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
              {t("changePasswordTitle")}
            </h2>
            <p className="text-sm text-[color:var(--text-muted)] mt-1">
              {t("changePasswordHint")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("newPassword")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label={t("confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {pwdMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-lg inline-flex items-center gap-1.5 ${
                pwdMsg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {pwdMsg.type === "success" && <Check className="w-4 h-4" />}
              {pwdMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={changePassword}
              loading={changingPwd}
              disabled={!newPassword || !confirmPassword}
            >
              {t("changePasswordButton")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
