import React, { useEffect, useState, useMemo, useRef } from "react";
import { ShoppingCart, Bell, Search, User, X, LogOut, Package, Menu as MenuIcon, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

  // --- Fetch products ---
  useEffect(() => {
    fetch("http://localhost/pastry_system/customer/api_products.php")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  // --- Fetch orders (notifications) ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost/pastry_system/customer/api_get_orders.php");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Add read=false to track unread
          const parsed = data.map(o => ({ ...o, read: false }));
          setNotifications(parsed);
        } else setNotifications([]);
      } catch {
        setNotifications([]);
      }
    };
    fetchOrders();
  }, []);

  // --- Live notifications on new orders ---
  useEffect(() => {
    const handleNewOrder = (e) => {
      const newOrder = { ...e.detail, read: false };
      setNotifications(prev => [newOrder, ...prev]);
    };
    window.addEventListener("orderPlaced", handleNewOrder);
    return () => window.removeEventListener("orderPlaced", handleNewOrder);
  }, []);

  // --- Close dropdowns when clicking outside ---
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

  // --- Unread notifications count ---
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // --- Toggle notification dropdown ---
  const handleToggleNotif = () => {
    setOpenNotif(prev => !prev);
    if (!openNotif) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // --- Select / deselect single notification ---
  const handleSelectNotif = (e, id) => {
    e.stopPropagation();
    setSelectedNotifs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // --- Select / deselect all notifications ---
  const handleSelectAll = () => {
    if (selectedNotifs.length === notifications.length) setSelectedNotifs([]);
    else setSelectedNotifs(notifications.map(n => n.id));
  };

  // --- Delete selected notifications ---
  const handleDeleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifs.includes(n.id)));
    setSelectedNotifs([]);
    setTrashMode(false);
  };

  // --- Filter products for search ---
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    return products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [search, products]);

  const handleLogout = () => {
    localStorage.removeItem("customer_orders");
    window.location.href = "http://localhost/pastry_system/login.php";
  };

  const navs = [
    { name: "Dashboard", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Orders", path: "/orders" }
  ];

  return (
    <nav className="sticky top-0 z-[50000] bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 xl:px-10 py-5">
      <div className="flex items-center justify-between">

        {/* LEFT: LOGO + NAV */}
        <div className="flex items-center gap-14">
          <Link to="/" className="flex items-center gap-4">
            <img src="http://localhost/pastry_system/uploads/logo.jpg" alt="Logo" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="text-[28px] font-bold italic leading-none text-black">
                Pastry <span className="text-[#d4af37]">Project</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.35em] text-gray-400 mt-1">baked fresh daily</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navs.map(nav => (
              <Link
                key={nav.path}
                to={nav.path}
                className={`relative text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${location.pathname === nav.path ? "text-black font-semibold" : "text-gray-400 hover:text-black"}`}
              >
                {nav.name}
                {location.pathname === nav.path && <span className="absolute left-0 -bottom-2 w-full h-[2px] rounded-full bg-[#d4af37]" />}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: ICONS */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div ref={searchRef} className="relative">
            <button onClick={() => setOpenSearch(!openSearch)} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
              <Search size={20} />
            </button>
            {openSearch && (
              <div className="absolute right-0 top-[65px] w-[380px] bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <Search size={18} className="text-gray-400" />
                  <input autoFocus type="text" placeholder="Search pastries..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-[13px] outline-none"/>
                  <button onClick={() => { setOpenSearch(false); setSearch(""); }} className="text-gray-400 hover:text-black"><X size={18}/></button>
                </div>
                <div className="max-h-[340px] overflow-y-auto p-3">
                  {filteredProducts.map((product, index) => (
                    <div key={index} onClick={() => { navigate("/menu"); setOpenSearch(false); setSearch(""); }} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                      <img src={`http://localhost/pastry_system/uploads/${product.image}`} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100"/>
                      <div>
                        <h3 className="text-[13px] font-semibold text-black">{product.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div ref={notifRef} className="relative">
            <button onClick={handleToggleNotif} className="relative w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center border-2 border-white font-bold">{unreadCount}</span>
              )}
            </button>
            {openNotif && (
              <div className="absolute right-0 top-[65px] w-[350px] bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                  <h4 className="text-[10px] uppercase font-bold text-gray-800">Notifications</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setTrashMode(!trashMode)} className="text-gray-500 hover:text-black"><Trash2 size={16}/></button>
                    {trashMode && notifications.length > 0 && (
                      <button onClick={handleSelectAll} className="text-[9px] text-[#d4af37] font-bold hover:underline">
                        {selectedNotifs.length === notifications.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                    {trashMode && selectedNotifs.length > 0 && (
                      <button onClick={handleDeleteSelected} className="text-[9px] text-red-500 font-bold hover:underline">
                        Delete Selected
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                      <p className="text-[13px] text-gray-400">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map(order => {
                      const isSelected = selectedNotifs.includes(order.id);
                      return (
                        <div key={order.id} className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer relative`} onClick={() => { navigate("/orders"); setOpenNotif(false); }}>
                          {trashMode && (
                            <div className="flex items-center">
                              <input type="checkbox" checked={isSelected} onChange={e => handleSelectNotif(e, order.id)} className="mr-2"/>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[13px] font-semibold text-black truncate">Order #{order.id}</h5>
                            <p className="text-[11px] text-gray-500 truncate">{order.items?.[0]?.name || 'No items'} - {order.status}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CART */}
          <button onClick={onCartClick} className="relative bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:bg-[#d4af37] hover:text-black transition-all">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">{cartCount}</span>
            )}
          </button>

          {/* ACCOUNT */}
          <div ref={accountRef} className="relative">
            <button onClick={() => setOpenAccount(!openAccount)} className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:border-[#d4af37] transition-all">
              <User size={20} className="text-gray-700" />
            </button>
            {openAccount && (
              <div className="absolute right-0 top-[65px] w-[240px] bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Customer Account</p>
                  <h3 className="text-[16px] text-black mt-1 font-semibold">Welcome Back</h3>
                </div>
                <div className="p-2">
                  <button onClick={() => { navigate("/orders"); setOpenAccount(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-[13px] transition-all group">
                    <Package size={16} className="text-gray-400 group-hover:text-black" /> My Orders
                  </button>
                  <button onClick={() => { navigate("/menu"); setOpenAccount(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-[13px] transition-all group">
                    <MenuIcon size={16} className="text-gray-400 group-hover:text-black" /> Browse Menu
                  </button>
                  <button onClick={() => { handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-500 text-[13px] transition-all">
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