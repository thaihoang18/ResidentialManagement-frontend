import { Toaster } from "sonner";
import HomePage from "./pages/homepage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router";
import Meeting from "./pages/meeting";
import Household from "./pages/household";
import Resident from "./pages/resident";
import SideBar from "./components/SideBar";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen flex bg-background">
          <SideBar />
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
