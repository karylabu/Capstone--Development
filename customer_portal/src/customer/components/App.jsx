import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

/* CUSTOMER */
import CustomerApp from "./customer/components/CustomerApp";
import Login from "./customer/pages/Login";           // ← your Login.jsx
import ForgotPassword from "./customer/pages/ForgotPassword"; // ← your ForgotPassword.jsx

/* STAFF */
import StaffApp from "./staff/components/StaffApp";

function App() {
  return (
    <Router basename="/Capstone--Development">
      <Routes>

        {/* ROOT → redirect to login */}
        <Route
          path="/"
          element={<Navigate to="customer/login" replace />}
        />

        {/* ── AUTH (no navbar) ── */}
        <Route path="customer/login"          element={<Login />} />
        <Route path="customer/forgot-password" element={<ForgotPassword onBack={() => window.location.href = "/pastry_system/customer/login"} />} />

        {/* ================= CUSTOMER ================= */}
        <Route path="customer/*" element={<CustomerApp />} />

        {/* ================= STAFF ================= */}
        <Route path="staff/*" element={<StaffApp />} />

        {/* FALLBACK */}
        <Route path="*" element={<div style={{ padding: 20 }}>404 Not Found</div>} />

      </Routes>
    </Router>
  );
}

export default App;
