import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell,
  User,
  Package,
  Menu as MenuIcon,
  LogOut,
  BarChart2
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { STAFF_BASE } from "../../services/config";

export default function StaffNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openNotif, setOpenNotif] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = () => {
      fetch(`${STAFF_BASE}/api_orders.php`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data
              .filter(o => o.status === "Pending" || o.status === "Preparing")
              .map(o => ({ ...o, read: false }));
            setNotifications(mapped);
          }
        })
        .catch(() => setNotifications([]));
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setOpenAccount(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleToggleNotif = () => {
    setOpenNotif(prev => !prev);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    window.location.href = `${STAFF_BASE}/../staff_login.php`;
  };

  const navs = [
    { name: "Dashboard", path: "/staff" },
    { name: "Orders",    path: "/staff/orders" },
    { name: "Products",  path: "/staff/products" },
    { name: "Reports",   path: "/staff/reports" },   // ← Customers → Reports
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[99999] bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 xl:px-10 py-5">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-14">
          <Link to="/staff" className="flex items-center gap-4">
            <img
              src="http://localhost/Capstone--Development/uploads/logo.jpg"
              className="h-14 w-auto"
              alt="Logo"
            />
            <div>
              <h1 className="text-[28px] font-bold italic">
                Pastry <span className="text-[#d4af37]">Project</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.35em] text-gray-400">
                staff management panel
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navs.map(nav => (
              <Link
                key={nav.path}
                to={nav.path}
                className={`text-[10px] uppercase tracking-[0.3em] transition-colors ${
                  location.pathname === nav.path
                    ? "text-black font-semibold"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {nav.name}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATIONS */}
          <div ref={notifRef} className="relative">
            <button
              onClick={handleToggleNotif}
              className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 top-[65px] w-[320px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <h3 className="text-xs uppercase font-bold">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => navigate("/staff/orders")}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                      >
                        <p className="text-sm font-semibold">Order #{n.id}</p>
                        <p className="text-xs text-gray-500">{n.status} • ₱{Number(n.total).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACCOUNT */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setOpenAccount(!openAccount)}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <User size={20} />
            </button>

            {openAccount && (
              <div className="absolute right-0 top-[65px] w-[240px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Staff Account</p>
                  <h3 className="text-sm font-semibold mt-1">Welcome Staff</h3>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { navigate("/staff/orders"); setOpenAccount(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    <Package size={16} /> Orders
                  </button>
                  <button
                    onClick={() => { navigate("/staff/products"); setOpenAccount(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    <MenuIcon size={16} /> Products
                  </button>
                  <button
                    onClick={() => { navigate("/staff/reports"); setOpenAccount(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"
                  >
                    <BarChart2 size={16} /> Reports
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
