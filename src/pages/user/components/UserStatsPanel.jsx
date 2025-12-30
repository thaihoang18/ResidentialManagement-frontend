import React, { useMemo } from "react";

function StatCard({ title, value, hint }) {
  return (
    <div className="glass-panel rounded-xl border p-4">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function UserStatsPanel({ stats }) {
  const totals = stats?.totals || { total: 0, active: 0, inactive: 0 };
  const breakdown = Array.isArray(stats?.breakdown) ? stats.breakdown : [];

  const byRole = useMemo(() => {
    const map = new Map();
    for (const row of breakdown) {
      const role = row?.role ?? "unknown";
      const count = Number(row?.count ?? 0);
      const status = !!row?.status;
      const prev = map.get(role) || { active: 0, inactive: 0 };
      map.set(role, {
        active: prev.active + (status ? count : 0),
        inactive: prev.inactive + (!status ? count : 0),
      });
    }
    return map;
  }, [breakdown]);

  const leader = byRole.get("leader") || { active: 0, inactive: 0 };
  const deputy = byRole.get("deputy") || { active: 0, inactive: 0 };
  const officer = byRole.get("officer") || { active: 0, inactive: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <StatCard title="Tổng tài khoản" value={totals.total ?? 0} />
      <StatCard title="Đang hoạt động" value={totals.active ?? 0} hint="Active" />
      <StatCard title="Đã khóa" value={totals.inactive ?? 0} hint="Lock" />
      <StatCard
        title="Theo vai trò"
        value={`${(leader.active + leader.inactive) || 0} / ${(deputy.active + deputy.inactive) || 0} / ${(officer.active + officer.inactive) || 0}`}
        hint="leader / deputy / officer"
      />
    </div>
  );
}
