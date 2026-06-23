import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";
import { CUSTOMER_BASE } from "../../services/config";

const BASE = CUSTOMER_BASE;

// Reusable input
function Input({ type = "text", placeholder, value, onChange, maxLength, inputMode }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      inputMode={inputMode}
      className="w-full h-[58px] bg-[#f5f6fa] rounded-[18px] px-5 text-[15px] outline-none border border-transparent focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.15)] transition-all"
    />
  );
}

// Reusable primary button
function Btn({ onClick, disabled, children, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-[58px] bg-black text-white rounded-[18px] text-[13px] font-black uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all active:scale-[0.98] disabled:opacity-40 mt-2"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

// Alert box
function Alert({ type, msg }) {
  if (!msg) return null;
  const styles = type === "success"
    ? "bg-green-50 text-green-700 border-green-100"
    : "bg-red-50 text-red-500 border-red-100";
  return (
    <div className={`border rounded-2xl px-4 py-3 text-[13px] mb-4 ${styles}`}>
      {msg}
    </div>
  );
}

export default function ForgotPassword({ onBack }) {
  // step: 'email' | 'code' | 'password' | 'done'
  const [step, setStep]         = useState("email");
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState("");
  const [newPass, setNewPass]   = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const clearAlerts = () => { setError(""); setSuccess(""); };

  // ── Step 1: Send code ──────────────────────────────────────────────────────
  const handleSendCode = async () => {
    clearAlerts();
    if (!email) return setError("Please enter your email.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api_forgot_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("A 6-digit code has been sent to your email.");
        setTimeout(() => { clearAlerts(); setStep("code"); }, 1200);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify code ────────────────────────────────────────────────────
  const handleVerifyCode = async () => {
    clearAlerts();
    if (code.length !== 6) return setError("Enter the 6-digit code.");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api_verify_reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        clearAlerts();
        setStep("password");
      } else {
        setError(data.message || "Invalid or expired code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    clearAlerts();
    if (newPass.length < 6) return setError("Password must be at least 6 characters.");
    if (newPass !== confirmPass) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api_reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPass }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("done");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step configs ───────────────────────────────────────────────────────────
  const steps = {
    email: {
      icon: <Mail size={28} className="text-[#d4af37]" strokeWidth={1.5} />,
      title: "Forgot Password",
      subtitle: "Enter your registered email and we'll send you a 6-digit reset code.",
    },
    code: {
      icon: <KeyRound size={28} className="text-[#d4af37]" strokeWidth={1.5} />,
      title: "Enter Code",
      subtitle: `We sent a code to ${email}. It expires in 15 minutes.`,
    },
    password: {
      icon: <Lock size={28} className="text-[#d4af37]" strokeWidth={1.5} />,
      title: "New Password",
      subtitle: "Choose a strong new password for your account.",
    },
    done: {
      icon: <span className="text-4xl">✅</span>,
      title: "All Done!",
      subtitle: "Your password has been updated. You can now log in.",
    },
  };

  const current = steps[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22 }}
        className="w-full"
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#fdf8ee] flex items-center justify-center mb-5">
          {current.icon}
        </div>

        <h2 className="text-[32px] font-black text-gray-900 leading-tight mb-2">
          {current.title}
        </h2>
        <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
          {current.subtitle}
        </p>

        <Alert type="error"   msg={error}   />
        <Alert type="success" msg={success} />

        {/* ── Email step ── */}
        {step === "email" && (
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Btn onClick={handleSendCode} loading={loading}>
              Send Reset Code
            </Btn>
          </div>
        )}

        {/* ── Code step ── */}
        {step === "code" && (
          <div className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full h-[72px] bg-[#f5f6fa] rounded-[18px] px-5 text-[36px] font-black tracking-[0.4em] text-center outline-none border border-transparent focus:border-[#d4af37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.15)] transition-all"
            />
            <Btn onClick={handleVerifyCode} loading={loading}>
              Verify Code
            </Btn>
            <button
              onClick={() => { clearAlerts(); setStep("email"); }}
              className="w-full text-[12px] text-gray-400 hover:text-gray-600 transition mt-1 uppercase tracking-widest font-bold"
            >
              Resend Code
            </button>
          </div>
        )}

        {/* ── New password step ── */}
        {step === "password" && (
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
            />
            <Btn onClick={handleResetPassword} loading={loading}>
              Update Password
            </Btn>
          </div>
        )}

        {/* ── Done step ── */}
        {step === "done" && (
          <Btn onClick={onBack}>
            Back to Login
          </Btn>
        )}

        {/* Back link */}
        {step !== "done" && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 mt-6 text-[12px] text-gray-400 hover:text-gray-700 transition font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
