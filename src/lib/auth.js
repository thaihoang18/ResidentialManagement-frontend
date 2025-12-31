const API_BASE = import.meta.env.VITE_API_URL || "";

function getAccountRoleFromEmail(email) {
  const normalized = String(email || "").toLowerCase();
  if (normalized.includes("leader")) return "leader";
  if (normalized.includes("deputy")) return "deputy";
  if (normalized.includes("officer")) return "officer";
  return "officer";
}

export function getRoleFromEmail(email) {
  // Backward-compatible alias
  return getAccountRoleFromEmail(email);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password_hash: password }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok && data.success) {
    const backendUser = data?.data && typeof data.data === "object" ? data.data : null;
    const accountRole = String(backendUser?.role ?? "").trim() || getAccountRoleFromEmail(backendUser?.email ?? email);
    const payload = {
      email: backendUser?.email ?? email,
      role: accountRole,
      accountRole,
      full_name: backendUser?.full_name,
      id: backendUser?.id,
      status: backendUser?.status,
    };
    localStorage.setItem("rm_user", JSON.stringify(payload));
    try {
      window.dispatchEvent(new Event('rm_auth_changed'))
    } catch (e) {}
    return { ok: true, data };
  }

  return { ok: false, error: data.error || data.message || "Login failed" };
}

export function logout() {
  localStorage.removeItem("rm_user");
  try {
    window.dispatchEvent(new Event('rm_auth_changed'))
  } catch (e) {}
}

export function isAuthenticated() {
  return !!localStorage.getItem("rm_user");
}

export function getUser() {
  try {
    const user = JSON.parse(localStorage.getItem("rm_user"));
    if (!user) return null;
    // role can be legacy (admin/officer) or new (leader/deputy/officer)
    const roleRaw = user.role ? String(user.role) : "";
    const accountRoleRaw = user.accountRole ? String(user.accountRole) : "";
    const email = user.email;

    let role = roleRaw || accountRoleRaw || getAccountRoleFromEmail(email);
    // Legacy mapping: keep deputy (least-privileged of admins)
    if (role === "admin") role = "deputy";
    if (role !== "leader" && role !== "deputy" && role !== "officer") {
      role = getAccountRoleFromEmail(email);
    }

    const normalized = {
      ...user,
      email,
      role,
      accountRole: accountRoleRaw || role,
    };
    return normalized;
  } catch (e) {
    return null;
  }
}

export function getUserRole() {
  const user = getUser();
  return user?.role || getRoleFromEmail(user?.email);
}
