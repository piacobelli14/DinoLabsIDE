import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/DinoLabsIDEAuthnetication/DinoLabsAuthLogin"; 
import Register from "./pages/DinoLabsIDEAuthnetication/DinoLabsAuthRegister"; 
import Reset from "./pages/DinoLabsIDEAuthnetication/DinoLabsAuthReset";
import Verification from "./pages/DinoLabsIDEAuthnetication/DinoLabsAuthVerifyEmail";
import Profile from "./pages/DinoLabsAccount/DinoLabsAccountProfile"; 
import Settings from "./pages/DinoLabsAccount/DinoLabsAccountSettings";   
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
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/reset" element={<Reset/>}/>
          <Route path="/verify" element={<Verification/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/dinolabs-ide" element={
            <ProtectedRoute>
              <DinoLabsIDE />
            </ProtectedRoute>
          } />

          <Route index element={<Navigate to="dinolabs-ide" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
