import { Toaster } from "sonner";
import HomePage from "./pages/homepage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import Meeting from "./pages/meeting";
import Household from "./pages/household";
import Resident from "./pages/resident";
import TemporaryStayLeave from "./pages/temporaryStayLeave";
import UserPage from "./pages/user";
import ProfilePage from "./pages/profile";
import SideBar from "./components/SideBar";
import Login from "./pages/auth";
import CheckinPage from "./pages/checkin";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./lib/auth";
import { useEffect, useState } from "react";
import AppTransitionOverlay from "./components/AppTransitionOverlay";

function SidebarGate() {
  const location = useLocation();
  const [authed, setAuthed] = useState(isAuthenticated());

  useEffect(() => {
    const onAuth = () => setAuthed(isAuthenticated());
    window.addEventListener("rm_auth_changed", onAuth);
    return () => window.removeEventListener("rm_auth_changed", onAuth);
  }, []);

  if (!authed) return null;
  if (location.pathname.startsWith("/login")) return null;
  if (location.pathname.startsWith("/checkin")) return null;
  return <SideBar />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <main className="flex-1">
      <div key={location.pathname} className="rm-page-transition">
        <Routes location={location}>
          <Route path="/login" element={<Login />} />

          {/* Public: residents scan QR to check-in */}
          <Route path="/checkin" element={<CheckinPage />} />

          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["leader","deputy","officer"]}><HomePage /></ProtectedRoute>}
          />
          <Route
            path="/meeting"
            element={<ProtectedRoute allowedRoles={["leader","deputy","officer"]}><Meeting /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute allowedRoles={["leader","deputy","officer"]}><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/household"
            element={<ProtectedRoute allowedRoles={["leader","deputy"]}><Household /></ProtectedRoute>}
          />
          <Route
            path="/resident"
            element={<ProtectedRoute allowedRoles={["leader","deputy"]}><Resident /></ProtectedRoute>}
          />
          <Route
            path="/temporary"
            element={<ProtectedRoute allowedRoles={["leader","deputy"]}><TemporaryStayLeave /></ProtectedRoute>}
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["leader"]}>
                <UserPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        </Routes>
      </div>
    </main>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppTransitionOverlay />
        <div className="min-h-screen flex">
          <SidebarGate />
          <AppRoutes />
        </div>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </>
  )
}

export default App