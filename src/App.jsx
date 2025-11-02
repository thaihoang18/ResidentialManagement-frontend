import { Toaster, toast } from "sonner";
import HomePage from "./pages/homepage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router";
import Meeting from "./pages/meeting";

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />

          <Route 
            path="*" 
            element={<NotFound />} 
          />

          {/* <Route 
            path="/login" 
            element={<LoginPage />} 
          /> */}
          <Route 
            path="/meeting" 
            element={<Meeting />} 
          />

        </Routes>
      </BrowserRouter>
    </>
  )
}


export default App
