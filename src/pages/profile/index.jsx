import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfoCard from "./components/ProfileInfoCard";
import ProfilePasswordCard from "./components/ProfilePasswordCard";

function roleLabel(accountRole) {
  const r = String(accountRole ?? "").toLowerCase();
  if (r === "leader") return "Tổ trưởng";
  if (r === "deputy") return "Tổ phó";
  if (r === "officer") return "Cán bộ";
  return "Cán bộ";
}

function initials(name, email) {
  const raw = String(name ?? "").trim();
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (a + b).toUpperCase() || "U";
  }
  const e = String(email ?? "").trim();
  return (e[0] || "U").toUpperCase();
}

export default function ProfilePage() {
  const localUser = useMemo(() => getUser(), []);
  const email = localUser?.email || "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const [fullName, setFullName] = useState(localUser?.full_name || "");
  const [newEmail, setNewEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    if (!email) {
      setError("Không tìm thấy thông tin đăng nhập");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/me?email=${encodeURIComponent(email)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Lỗi tải hồ sơ");

      const data = json?.data || null;
      setProfile(data);
      setFullName(String(data?.full_name ?? localUser?.full_name ?? ""));
      setNewEmail("");
    } catch (e) {
      setProfile(null);
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [email, localUser?.full_name]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const canSave = useMemo(() => {
    const nameChanged = String(fullName).trim() && String(fullName).trim() !== String(profile?.full_name ?? "").trim();
    const emailChanged = String(newEmail).trim() && String(newEmail).trim() !== String(profile?.email ?? email).trim();
    return nameChanged || emailChanged;
  }, [email, fullName, newEmail, profile?.email, profile?.full_name]);

  const onSaveProfile = async () => {
    if (!email) return;

    const nextFullName = String(fullName).trim();
    const nextEmail = String(newEmail).trim();

    if (!nextFullName && !nextEmail) {
      toast.message("Không có thay đổi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: nextFullName || null,
          new_email: nextEmail || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Lỗi cập nhật hồ sơ");

      const updated = json?.data || null;
      setProfile(updated);
      setNewEmail("");

      // Keep local auth in sync (email/full_name). Preserve current app role.
      try {
        const stored = JSON.parse(localStorage.getItem("rm_user")) || {};
        const nextStored = {
          ...stored,
          email: updated?.email ?? stored.email,
          full_name: updated?.full_name ?? stored.full_name,
          accountRole: updated?.role ?? stored.accountRole,
          status: updated?.status ?? stored.status,
          id: updated?.id ?? stored.id,
        };
        localStorage.setItem("rm_user", JSON.stringify(nextStored));
        window.dispatchEvent(new Event("rm_auth_changed"));
      } catch {
        // ignore
      }

      toast.success("Đã cập nhật hồ sơ");
    } catch (e) {
      toast.error(e?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!email) return;
    if (!currentPassword || !nextPassword) {
      toast.error("Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới");
      return;
    }
    if (nextPassword.length < 4) {
      toast.error("Mật khẩu mới quá ngắn");
      return;
    }
    if (nextPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          current_password: currentPassword,
          new_password: nextPassword,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Đổi mật khẩu thất bại");

      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      toast.success("Đã đổi mật khẩu");
    } catch (e) {
      toast.error(e?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPasswordSaving(false);
    }
  };

  const titleName = profile?.full_name || localUser?.full_name || "Tài khoản";
  const titleEmail = profile?.email || email;
  const badgeText = roleLabel(profile?.role ?? localUser?.accountRole ?? localUser?.role);
  const locked = profile?.status === false;
  const avatarInitials = initials(titleName, titleEmail);

  return (
    <div className="p-6">
      <ProfileHeader name={titleName} email={titleEmail} roleLabel={badgeText} locked={locked} />

      {error ? (
        <div className="glass-panel rounded-xl border p-4 text-destructive">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileInfoCard
          email={titleEmail}
          fullName={fullName}
          onFullNameChange={setFullName}
          newEmail={newEmail}
          onNewEmailChange={setNewEmail}
          loading={loading}
          saving={saving}
          canSave={canSave}
          onReload={loadProfile}
          onSave={onSaveProfile}
        />

        <ProfilePasswordCard
          currentPassword={currentPassword}
          onCurrentPasswordChange={setCurrentPassword}
          nextPassword={nextPassword}
          onNextPasswordChange={setNextPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          loading={loading}
          saving={passwordSaving}
          onChangePassword={onChangePassword}
        />
      </div>
    </div>
  );
}
