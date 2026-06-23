import { Search, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BASE } from "../../services/config";

export default function AdminNavbar() {

  const location = useLocation();

  const navs = [
    {
      name: "Dashboard",
      path: "/admin/dashboard"
    },
    {
      name: "Products",
      path: "/admin/products"
    },
    {
      name: "Inventory",
      path: "/admin/inventory"
    },
    {
      name: "Orders",
      path: "/admin/orders"
    },
    {
      name: "Reports",
      path: "/admin/reports"
    }
  ];

  return (
    <nav className="sticky top-0 z-[50000] bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 xl:px-10 py-5">

      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-10">

          {/* LOGO */}
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-4 flex-shrink-0"
          >

            <img
              src={`${BASE}/uploads/logo.jpg`}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />

            <div>

              <h1 className="text-[28px] font-bold italic leading-none">
                Pastry <span className="text-[#d4af37]">Project</span>
              </h1>

              <p className="text-[8px] uppercase tracking-[0.35em] text-gray-400 mt-1">
                admin panel
              </p>

            </div>

          </Link>

          {/* NAV LINKS */}
          <div className="flex items-center gap-8 xl:gap-10">

            {navs.map((nav) => (

              <Link
                key={nav.path}
                to={nav.path}
                className={`text-[10px] uppercase tracking-[0.3em] whitespace-nowrap transition ${
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
        <div className="flex items-center gap-4 flex-shrink-0">

          {/* SEARCH */}
          <button className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition">

            <Search
              size={20}
              className="text-gray-600"
            />

          </button>

          {/* NOTIFICATIONS */}
          <div className="relative">

            <button className="relative w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition">

              <Bell
                size={20}
                className="text-gray-600"
              />

              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                5
              </span>

            </button>

          </div>

          {/* ACCOUNT */}
          <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">

            <User
              size={20}
              className="text-gray-600"
            />

          </button>

        </div>

      </div>

    </nav>
  );
}