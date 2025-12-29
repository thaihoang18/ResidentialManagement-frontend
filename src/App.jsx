import { Toaster } from "sonner";
import HomePage from "./pages/homepage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router";
import Meeting from "./pages/meeting";
import Household from "./pages/household";
import Resident from "./pages/resident";
import TemporaryStayLeave from "./pages/temporaryStayLeave";
import SideBar from "./components/SideBar";
import Login from "./pages/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./lib/auth";
import { useEffect, useState } from "react";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen flex bg-transparent">
          {/** keep a state so SideBar updates after login/logout */}
          {(() => {
            const [authed, setAuthed] = useState(isAuthenticated())
            useEffect(() => {
              const onAuth = () => setAuthed(isAuthenticated())
              window.addEventListener('rm_auth_changed', onAuth)
              return () => window.removeEventListener('rm_auth_changed', onAuth)
            }, [])
            return authed && <SideBar />
          })()}
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={<ProtectedRoute><HomePage /></ProtectedRoute>}
              />
              <Route
                path="/meeting"
                element={<ProtectedRoute><Meeting /></ProtectedRoute>}
              />
              <Route
                path="/household"
                element={<ProtectedRoute><Household /></ProtectedRoute>}
              />
              <Route
                path="/resident"
                element={<ProtectedRoute><Resident /></ProtectedRoute>}
              />
              <Route
                path="/temporary"
                element={<ProtectedRoute><TemporaryStayLeave /></ProtectedRoute>}
              />
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </>
  )
}

export default App
