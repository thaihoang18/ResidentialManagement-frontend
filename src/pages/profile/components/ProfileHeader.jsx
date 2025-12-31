import React from "react";
import { Badge } from "@/components/ui/badge";
import { CircleUser } from "lucide-react";

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

export default function ProfileHeader({
  name,
  email,
  roleLabel,
  locked,
}) {
  return (
    <div className="mb-6">
      <div className="page-header glass-header rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient border border-border/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <CircleUser className="size-7 text-[color:var(--primary-dark)]" />
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Hồ sơ</h1>
          </div>
          <p className="text-base text-muted-foreground">Xem và chỉnh sửa thông tin tài khoản đang đăng nhập</p>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl border border-border/60 text-foreground flex items-center justify-center font-semibold"
            style={{
              background:
                "radial-gradient(120% 100% at 20% 20%, rgba(var(--brand-cyan-rgb),0.20) 0%, rgba(255,255,255,0.70) 55%, rgba(255,255,255,0.46) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.16)",
              backdropFilter: "blur(18px) saturate(1.25)",
              WebkitBackdropFilter: "blur(18px) saturate(1.25)",
            }}
          >
            {initials(name, email)}
          </div>

          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-foreground">{name || "Tài khoản"}</div>
            <div className="truncate text-sm font-semibold text-foreground">{email || "-"}</div>

            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{roleLabel}</Badge>
              {locked ? <Badge variant="destructive">Đã khóa</Badge> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
