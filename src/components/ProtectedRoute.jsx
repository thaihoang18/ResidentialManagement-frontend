import React from "react";
import { Navigate, useLocation } from "react-router";
import { getUserRole, isAuthenticated } from "@/lib/auth";

const OFFICER_ALLOWED_PATHS = new Set(["/", "/meeting"]);

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const role = getUserRole();

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  }

  if (role === "officer" && !OFFICER_ALLOWED_PATHS.has(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
