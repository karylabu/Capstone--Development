import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ForgotPassword from "./ForgotPassword";
import { CUSTOMER_BASE } from "../../services/config";

// ✅ CORRECT
const BASE = CUSTOMER_BASE;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res  = await fetch(`${BASE}/api_login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "staff") {
          navigate("/staff");
        } else if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/customer");
        }
      } else {
        setError(data.message || "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f8] to-[#ffe3eb] flex items-center justify-center p-6 relative overflow-hidden font-['DM_Sans']">

      {/* Background blobs */}
      <div className="absolute w-80 h-80 rounded-full bg-[#ff9ec4] blur-[70px] opacity-35 -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-[#ffd166] blur-[70px] opacity-35 -bottom-20 -right-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[430px] bg-white/85 backdrop-blur-xl border border-white/40 rounded-[34px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

        <p className="text-[13px] tracking-[0.4em] uppercase text-[#d4af37] mb-4 font-bold">
          Pastry Project
        </p>

        <AnimatePresence mode="wait">

          {/* ── Forgot Password View ── */}
          {showForgot ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ForgotPassword onBack={() => setShowForgot(false)} />
            </motion.div>

          ) : (

          /* ── Login View ── */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-[42px] font-black text-gray-900 leading-none mb-2">
                Login
              </h1>
              <p className="text-[14px] text-gray-400 mb-8">
                Welcome back to your account
              </p>

              {error && (
                <div className="bg-red-50 text-red-500 border border-red-100 rounded-2xl px-4 py-3 text-[13px] mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-[58px] bg-[#f5f6fa] rounded-[18px] px-5 text-[15px] outline-none border border-transparent focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.15)] transition-all"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-[58px] bg-[#f5f6fa] rounded-[18px] px-5 text-[15px] outline-none border border-transparent focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.15)] transition-all"
                />

                {/* Forgot password link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setError(""); setShowForgot(true); }}
                    className="text-[13px] text-[#d4af37] font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[58px] bg-black text-white rounded-[18px] text-[13px] font-black uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  {loading ? "Logging in…" : "Login"}
                </button>

              </form>

              <p className="text-center text-[14px] text-gray-400 mt-6">
                Don't have an account?{" "}
                <a href="http://localhost/Capstone--Development/register.php">
    Sign up first
</a>
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
