import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnalyzerPage from "./pages/AnalyzerPage";
import PortalPage from "./pages/PortalPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalyzerPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/portal/:resource" element={<PortalPage />} />
        <Route path="/portal/:resource/:id" element={<PortalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
