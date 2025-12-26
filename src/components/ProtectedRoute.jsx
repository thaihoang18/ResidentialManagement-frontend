import React from "react";
import { Navigate } from "react-router";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
  if (isAuthenticated()) return children;
  return <Navigate to="/login" replace />;
}
