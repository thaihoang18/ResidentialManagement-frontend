import { Toaster, toast } from "sonner";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router";

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

        </Routes>
      </BrowserRouter>
    </>
  )
}


export default App
