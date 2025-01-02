import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
//import ProtectedRoute from "./ProtectedRoute";
import DinoLabsIDE from "./pages/DinoLabsIDE"; 
import { useEffect, useState } from "react";

import "./styles/App.css";

function App() {
  const [osClass, setOsClass] = useState("");

  useEffect(() => {
    const detectOS = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.indexOf("Win") !== -1) {
        return "windows";
      } else if (userAgent.indexOf("Mac") !== -1) {
        return "mac";
      }
      return "";
    };

    const os = detectOS();
    setOsClass(os);
  }, []);

  return (
    <Router>
      <div className={`App ${osClass}`}>
        <Routes>
          <Route path="/dinolabs-ide" element={
              <DinoLabsIDE />
          } />

          <Route index element={<Navigate to="dinolabs-ide" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
