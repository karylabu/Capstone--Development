import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost/pastry_system/login_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include" // important to send session cookie
      });

      const data = await res.json();

      if (data.status === "success") {
        // Fetch the user info after login from session
        const userRes = await fetch("http://localhost/pastry_system/api_user.php", {
          credentials: "include"
        });
        const userData = await userRes.json();

        localStorage.setItem("user", JSON.stringify(userData.user));

        // Redirect based on role
        switch (userData.user.role) {
          case "customer":
            navigate("/dashboard");
            break;
          case "staff":
            navigate("/staff/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d4af37]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d4af37]"
        />

        <button
          type="submit"
          className="w-full bg-[#d4af37] p-3 rounded-xl text-black font-bold hover:bg-yellow-400 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}