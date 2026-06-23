import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ShoppingCart,
  Bell,
  Search,
  User,
  X,
  LogOut,
  Package,
  Menu as MenuIcon,
  Trash2
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE, CUSTOMER_BASE } from '../../services/config';

export default function Navbar({ cartCount = 0, onCartClick }) {

  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [trashMode, setTrashMode] = useState(false);
  const [selectedNotifs, setSelectedNotifs] = useState([]);

  const [openSearch, setOpenSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  const [openAccount, setOpenAccount] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const accountRef = useRef(null);

  // use imported BASE and CUSTOMER_BASE from config

  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    fetch(`${CUSTOMER_BASE}/api_products.php`)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  /* =========================
     FETCH ORDERS (NOTIFS)
  ========================= */
  useEffect(() => {
    fetch(`${CUSTOMER_BASE}/api_get_orders.php`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data.map(o => ({ ...o, read: false })));
        }
      })
      .catch(() => setNotifications([]));
  }, []);

  /* =========================
     OUTSIDE CLICK CLOSE
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpenSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
        setTrashMode(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) setOpenAccount(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     UNREAD COUNT
  ========================= */
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  /* =========================
     OPEN NOTIF
  ========================= */
  const handleToggleNotif = () => {
    setOpenNotif(!openNotif);

    if (!openNotif) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  /* =========================
     NAV LINKS (FIXED)
  ========================= */
  const navs = [
    { name: "Dashboard", path: "" },
    { name: "Menu", path: "menu" },
    { name: "Orders", path: "orders" }
  ];

  return (
    <nav className="sticky top-0 z-[50000] bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 xl:px-10 py-5">

      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-14">

          <Link
            to=""
            className="flex items-center gap-4"
          >
            <img
              src={`${BASE}/uploads/logo.jpg`}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />

            <div>
              <h1 className="text-[28px] font-bold italic">
                Pastry <span className="text-[#d4af37]">Project</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.35em] text-gray-400 mt-1">
                baked fresh daily
              </p>
            </div>

          </Link>

          {/* NAV */}
          <div className="hidden lg:flex items-center gap-10">

            {navs.map(nav => (
              <Link
                key={nav.path}
                to={nav.path}
                className={`text-[10px] uppercase tracking-[0.3em] ${
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

          {/* SEARCH */}
          <button className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <Search size={20} />
          </button>

          {/* NOTIFICATIONS */}
          <div ref={notifRef} className="relative">

            <button
              onClick={handleToggleNotif}
              className="relative w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}

            </button>

            {openNotif && (
              <div className="absolute right-0 top-[65px] w-[320px] bg-white border rounded-xl shadow-xl p-3">

                <p className="font-bold text-sm mb-2">Notifications</p>

                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        navigate("orders");
                        setOpenNotif(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <p className="text-sm font-semibold">Order #{n.id}</p>
                      <p className="text-xs text-gray-500">{n.status}</p>
                    </div>
                  ))
                )}

              </div>
            )}

          </div>

          {/* CART */}
          <button
            onClick={onCartClick}
            className="relative bg-black text-white w-14 h-14 rounded-full flex items-center justify-center"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* ACCOUNT */}
          <div ref={accountRef} className="relative">

            <button
              onClick={() => setOpenAccount(!openAccount)}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <User size={20} />
            </button>

            {openAccount && (
              <div className="absolute right-0 top-[65px] w-[220px] bg-white border rounded-xl shadow-xl p-2">

                <button
                    onClick={() => {
                    navigate("/customer/orders");
                    setOpenAccount(false);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  My Orders
                </button>

                <button
                  onClick={() => {
                    navigate("/customer/menu");
                    setOpenAccount(false);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  Menu
                </button>

                              <button
                                onClick={() => {
                                  navigate('/customer/login');
                                  setOpenAccount(false);
                                }}
                                className="w-full text-left p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                Logout
                              </button>

              </div>
            )}

          </div>

        </div>

      </div>

    </nav>
  );
}