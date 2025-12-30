import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import UserHeader from "./components/UserHeader";
import UserStatsPanel from "./components/UserStatsPanel";
import UserTable from "./components/UserTable";
import UserFormDialog from "./components/UserFormDialog";
import UserPasswordDialog from "./components/UserPasswordDialog";
import UserStatusDialog from "./components/UserStatusDialog";
import UserBulkStatusDialog from "./components/UserBulkStatusDialog";

const EMPTY_FORM = {
  id: null,
  email: "",
  full_name: "",
  role: "officer",
  status: true,
  password_hash: "",
};

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [roles, setRoles] = useState(["leader", "deputy", "officer"]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkNextStatus, setBulkNextStatus] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusNext, setStatusNext] = useState(true);

  const roleOptions = useMemo(() => roles.map((r) => ({ value: r, label: r })), [roles]);

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/users/roles");
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      const list = Array.isArray(json?.data) ? json.data : null;
      if (list && list.length) setRoles(list);
    } catch {
      // ignore, fallback to default roles
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users?limit=500");
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Lỗi tải danh sách tài khoản");
      const rows = Array.isArray(json?.data) ? json.data : [];
      setUsers(rows);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/users/stats");
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Lỗi tải thống kê tài khoản");
      setStats(json?.data || null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadUsers();
    loadStats();
  }, [loadRoles, loadUsers, loadStats]);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setFormError(null);
    setForm({ ...EMPTY_FORM, role: roles?.[2] || "officer" });
    setFormOpen(true);
  }, [roles]);

  const openEdit = useCallback((row) => {
    setFormMode("edit");
    setFormError(null);
    setForm({
      ...EMPTY_FORM,
      id: row?.id ?? null,
      email: row?.email ?? "",
      full_name: row?.full_name ?? "",
      role: row?.role ?? "officer",
      status: !!row?.status,
      password_hash: "",
    });
    setFormOpen(true);
  }, []);

  const openPassword = useCallback((row) => {
    setPasswordError(null);
    setPasswordTarget(row);
    setPasswordOpen(true);
  }, []);

  const openStatus = useCallback((row, nextStatus) => {
    setStatusError(null);
    setStatusTarget(row);
    setStatusNext(!!nextStatus);
    setStatusOpen(true);
  }, []);

  async function submitForm(e) {
    e?.preventDefault?.();

    setFormSaving(true);
    setFormError(null);
    try {
      const payload = {
        email: String(form.email || "").trim(),
        full_name: String(form.full_name || "").trim(),
        role: form.role,
        status: !!form.status,
      };

      if (!payload.email || !payload.full_name || !payload.role) {
        throw new Error("Vui lòng nhập email, họ tên và vai trò");
      }

      if (formMode === "create") {
        const password_hash = String(form.password_hash || "");
        if (!password_hash) throw new Error("Vui lòng nhập mật khẩu");

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, password_hash }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Tạo tài khoản thất bại");

        toast.success("Đã tạo tài khoản");
      } else {
        if (!form.id) throw new Error("Thiếu ID tài khoản");
        const res = await fetch(`/api/users/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Cập nhật tài khoản thất bại");

        toast.success("Đã cập nhật tài khoản");
      }

      setFormOpen(false);
      await loadUsers();
    } catch (err) {
      setFormError(err?.message || "Có lỗi xảy ra");
    } finally {
      setFormSaving(false);
    }
  }

  async function submitPassword(password_hash) {
    if (!passwordTarget?.id) return;

    setPasswordSaving(true);
    setPasswordError(null);
    try {
      if (!password_hash) throw new Error("Vui lòng nhập mật khẩu");
      const res = await fetch(`/api/users/${passwordTarget.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password_hash }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Đổi mật khẩu thất bại");

      toast.success("Đã cập nhật mật khẩu");
      setPasswordOpen(false);
      setPasswordTarget(null);
      await loadUsers();
    } catch (err) {
      setPasswordError(err?.message || "Có lỗi xảy ra");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function confirmStatus() {
    if (!statusTarget?.id) return;

    setStatusSaving(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/users/${statusTarget.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusNext }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Cập nhật trạng thái thất bại");

      toast.success(statusNext ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      setStatusOpen(false);
      setStatusTarget(null);
      await loadUsers();
    } catch (err) {
      setStatusError(err?.message || "Có lỗi xảy ra");
    } finally {
      setStatusSaving(false);
    }
  }

  const selectedCount = selectedUsers.length;
  const selectedIds = useMemo(
    () => selectedUsers.map((u) => u?.id).filter((id) => Number.isFinite(Number(id))),
    [selectedUsers]
  );

  const openBulk = useCallback((next) => {
    if (!selectedIds.length) return;
    setBulkError(null);
    setBulkNextStatus(!!next);
    setBulkOpen(true);
  }, [selectedIds]);

  async function confirmBulkStatus() {
    if (!selectedIds.length) return;
    setBulkSaving(true);
    setBulkError(null);
    try {
      const res = await fetch("/api/users/bulk/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status: bulkNextStatus }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Thao tác hàng loạt thất bại");

      toast.success(bulkNextStatus ? "Đã mở khóa hàng loạt" : "Đã khóa hàng loạt");
      setBulkOpen(false);
      setSelectionResetKey((k) => k + 1);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (err) {
      setBulkError(err?.message || "Có lỗi xảy ra");
    } finally {
      setBulkSaving(false);
    }
  }

  return (
    <div className="p-6">
      <UserHeader onCreate={openCreate} />

      <UserStatsPanel stats={stats} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {statsLoading ? "Đang tải thống kê..." : null}
        </div>

        {selectedCount ? (
          <div className="glass-panel rounded-xl border px-4 py-2 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Đã chọn {selectedCount}</span>
            <button
              type="button"
              className="text-sm underline text-muted-foreground hover:text-foreground"
              onClick={() => setSelectionResetKey((k) => k + 1)}
            >
              Bỏ chọn
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button
              type="button"
              className="text-sm text-destructive hover:underline"
              onClick={() => openBulk(false)}
            >
              Khóa hàng loạt
            </button>
            <button
              type="button"
              className="text-sm accent-text hover:underline"
              onClick={() => openBulk(true)}
            >
              Mở khóa hàng loạt
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="glass-panel rounded-xl border p-4 text-destructive">
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={loadUsers}
          >
            Thử lại
          </button>
        </div>
      ) : null}

      <UserTable
        data={users}
        loading={loading}
        roleOptions={roleOptions}
        onEdit={openEdit}
        onPassword={openPassword}
        onToggleStatus={(row) => openStatus(row, !row?.status)}
        enableRowSelection
        onSelectionChange={setSelectedUsers}
        resetRowSelectionKey={selectionResetKey}
      />

      <UserFormDialog
        open={formOpen}
        mode={formMode}
        saving={formSaving}
        error={formError}
        form={form}
        roleOptions={roleOptions}
        onOpenChange={setFormOpen}
        onChange={setForm}
        onSubmit={submitForm}
      />

      <UserPasswordDialog
        open={passwordOpen}
        saving={passwordSaving}
        error={passwordError}
        user={passwordTarget}
        onOpenChange={setPasswordOpen}
        onSubmit={submitPassword}
      />

      <UserStatusDialog
        open={statusOpen}
        saving={statusSaving}
        error={statusError}
        user={statusTarget}
        nextStatus={statusNext}
        onOpenChange={setStatusOpen}
        onConfirm={confirmStatus}
      />

      <UserBulkStatusDialog
        open={bulkOpen}
        saving={bulkSaving}
        error={bulkError}
        count={selectedCount}
        nextStatus={bulkNextStatus}
        onOpenChange={setBulkOpen}
        onConfirm={confirmBulkStatus}
      />
    </div>
  );
}
