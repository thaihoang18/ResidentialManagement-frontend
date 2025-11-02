import { Toaster } from "sonner";
import HomePage from "./pages/homepage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router";
import Meeting from "./pages/meeting";
import SideBar from "./components/SideBar";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen flex bg-background">
          <SideBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/meeting" element={<Meeting />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </>
  )
}

export default App
