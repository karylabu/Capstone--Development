import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingCart } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { CUSTOMER_BASE, STAFF_BASE } from "../../services/config";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ORDERS
  ========================= */
  useEffect(() => {
    fetch(`${STAFF_BASE}/api_orders.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setOrders([]);
      });
  }, []);

  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    fetch(`${CUSTOMER_BASE}/api_products.php?action=list`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setProducts([]);
      });
  }, []);

  /* =========================
     FETCH CUSTOMERS
  ========================= */
  useEffect(() => {
    setLoading(false);
  }, []);

  /* =========================
     ANALYTICS - Revenue
  ========================= */
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  /* =========================
     ANALYTICS - Most Ordered Products
  ========================= */
  const mostOrderedProducts = useMemo(() => {
    const tally = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || "Unknown";
          tally[name] = (tally[name] || 0) + Number(item.qty || 1);
        });
      }
    });
    return Object.entries(tally)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  /* =========================
     ANALYTICS - Customer Activity
  ========================= */
  const uniqueCustomers = useMemo(() => {
    const unique = new Set();
    orders.forEach(order => {
      const email = order.email?.toLowerCase();
      if (email) unique.add(email);
    });
    return unique.size;
  }, [orders]);

  /* =========================
     ANALYTICS - System Statistics
  ========================= */
  const systemStats = useMemo(() => {
    const completed = orders.filter(o => o.status === "Completed").length;
    const pending = orders.filter(o => o.status === "Pending").length;
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
    return { completed, pending, avgOrderValue };
  }, [orders, totalRevenue]);

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <AdminNavbar />

      {/* HERO SECTION */}
      <div
        className="relative h-[540px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase tracking-[6px] text-gold text-sm mb-5">
            Pastry Project Admin
          </p>
          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            Manage Your
            <br />
            <span className="text-gold italic">Pastry Shop</span>
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {loading ? (
          <div className="text-center text-gray-500">Loading dashboard...</div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">Total Revenue</p>
                  <TrendingUp size={20} className="text-gold" />
                </div>
                <h2 className="text-4xl font-bold font-serif">₱{totalRevenue.toLocaleString()}</h2>
                <p className="text-xs text-gray-500 mt-2">from {orders.length} orders</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">Completed Orders</p>
                  <ShoppingCart size={20} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif">{systemStats.completed}</h2>
                <p className="text-xs text-gray-500 mt-2">{orders.length > 0 ? Math.round((systemStats.completed / orders.length) * 100) : 0}% completion rate</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">Avg Order Value</p>
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif">₱{Math.round(systemStats.avgOrderValue).toLocaleString()}</h2>
                <p className="text-xs text-gray-500 mt-2">average per order</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">Unique Customers</p>
                  <Users size={20} className="text-purple-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif">{uniqueCustomers}</h2>
                <p className="text-xs text-gray-500 mt-2">unique emails in orders</p>
              </motion.div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
              {/* MOST ORDERED PRODUCTS */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100"
              >
                <div className="mb-6">
                  <p className="text-gold text-[10px] font-black tracking-[0.3em] uppercase mb-2">Best Sellers</p>
                  <h3 className="text-2xl font-serif font-bold">Most Ordered Products</h3>
                </div>
                {mostOrderedProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No order data available</p>
                ) : (
                  <div className="space-y-4">
                    {mostOrderedProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gold">{idx + 1}</span>
                          <span className="text-gray-700 font-medium">{product.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{product.qty} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>

            {/* SYSTEM STATISTICS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 mb-14"
            >
              <div className="mb-6">
                <p className="text-gold text-[10px] font-black tracking-[0.3em] uppercase mb-2">Overview</p>
                <h3 className="text-2xl font-serif font-bold">System Statistics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <p className="text-blue-600 text-sm font-semibold mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-900">{orders.length}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                  <p className="text-green-600 text-sm font-semibold mb-2">Completed</p>
                  <p className="text-3xl font-bold text-green-900">{systemStats.completed}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <p className="text-yellow-600 text-sm font-semibold mb-2">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{systemStats.pending}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <p className="text-purple-600 text-sm font-semibold mb-2">Products</p>
                  <p className="text-3xl font-bold text-purple-900">{products.length}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}