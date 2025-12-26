const API_BASE = import.meta.env.VITE_API_URL || "";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password_hash: password }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok && data.success) {
    localStorage.setItem("rm_user", JSON.stringify({ email }));
    return { ok: true, data };
  }

  return { ok: false, error: data.error || data.message || "Login failed" };
}

export function logout() {
  localStorage.removeItem("rm_user");
}

export function isAuthenticated() {
  return !!localStorage.getItem("rm_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("rm_user"));
  } catch (e) {
    return null;
  }
}
