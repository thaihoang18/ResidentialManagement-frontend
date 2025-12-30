const API_BASE = import.meta.env.VITE_API_URL || "";

export function getRoleFromEmail(email) {
  const normalized = (email || "").toLowerCase();
  if (normalized.includes("leader") || normalized.includes("deputy")) return "admin";
  if (normalized.includes("officer")) return "officer";
  // Default to the more restrictive role when unknown
  return "officer";
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password_hash: password }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok && data.success) {
    const role = getRoleFromEmail(email);
    localStorage.setItem("rm_user", JSON.stringify({ email, role }));
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
    if (!user.role) return { ...user, role: getRoleFromEmail(user.email) };
    return user;
  } catch (e) {
    return null;
  }
}

export function getUserRole() {
  const user = getUser();
  return user?.role || getRoleFromEmail(user?.email);
}
