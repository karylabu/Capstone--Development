import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword"; // adjust path as needed

export default function Login() {
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    // your existing login logic here
  };

  // ── Show forgot password view ──────────────────────────────────────────────
  if (showForgot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff7f8] to-[#ffe3eb] flex items-center justify-center p-6">
        {/* blobs */}
        <div className="absolute w-80 h-80 rounded-full bg-[#ff9ec4] blur-[70px] opacity-35 -top-20 -left-20" />
        <div className="absolute w-72 h-72 rounded-full bg-[#ffd166] blur-[70px] opacity-35 -bottom-20 -right-20" />

        <div className="relative z-10 w-full max-w-[430px] bg-white/85 backdrop-blur-xl border border-white/40 rounded-[34px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="text-[13px] tracking-[0.4em] uppercase text-[#d4af37] mb-6 font-bold">
            Pastry Project
          </div>
          <ForgotPassword onBack={() => setShowForgot(false)} />
        </div>
      </div>
    );
  }

  // ── Normal login view ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f8] to-[#ffe3eb] flex items-center justify-center p-6 relative overflow-hidden">
      {/* blobs */}
      <div className="absolute w-80 h-80 rounded-full bg-[#ff9ec4] blur-[70px] opacity-35 -top-20 -left-20" />
      <div className="absolute w-72 h-72 rounded-full bg-[#ffd166] blur-[70px] opacity-35 -bottom-20 -right-20" />

      <div className="relative z-10 w-full max-w-[430px] bg-white/85 backdrop-blur-xl border border-white/40 rounded-[34px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] font-['DM_Sans']">

        <p className="text-[13px] tracking-[0.4em] uppercase text-[#d4af37] mb-3 font-bold">
          Pastry Project
        </p>

        <h1 className="text-[42px] font-black text-gray-900 leading-none mb-2">Login</h1>
        <p className="text-[14px] text-gray-500 mb-8">Welcome back to your account</p>

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

          {/* ── Forgot password link ── */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-[13px] text-[#d4af37] font-bold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-[58px] bg-black text-white rounded-[18px] text-[13px] font-black uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all active:scale-[0.98] mt-2"
          >
            Login
          </button>
        </form>

        <p className="text-center text-[14px] text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-[#d4af37] font-bold hover:underline">
            Sign up first
          </a>
        </p>

      </div>
    </div>
  );
}
