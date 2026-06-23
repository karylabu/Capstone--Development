import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* STAFF NAVBAR */
import StaffNavbar from "../components/StaffNavbar";
import { STAFF_BASE } from "../../services/config";

const POLL_INTERVAL = 15000; // auto-refresh every 15 seconds

/* =========================
   TOAST COMPONENT
========================= */
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-2xl px-5 py-3 text-sm shadow-lg text-white max-w-xs
              ${t.type === "success" ? "bg-green-600"
              : t.type === "sms_fail" ? "bg-yellow-500"
              : "bg-red-500"}`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Orders() {

  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchId, setSearchId]         = useState("");
  const [sortOption, setSortOption]     = useState("Oldest");
  const [updatingId, setUpdatingId]     = useState(null);
  const [toasts, setToasts]             = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const pollRef = useRef(null);

  const statusFilterOptions = ["All", "Pending", "Preparing", "To Receive", "Completed", "Cancelled"];
  const sortOptions = ["Newest", "Oldest", "Highest total"];

  const statusColors = {
    Pending:      "bg-yellow-100 text-yellow-700",
    Preparing:    "bg-blue-100 text-blue-700",
    "To Receive": "bg-purple-100 text-purple-700",
    Completed:    "bg-green-100 text-green-700",
    Cancelled:    "bg-red-100 text-red-500",
  };

  /* =========================
     TOAST HELPERS
  ========================= */
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = (silent = false) => {
    if (!silent) setLoading(true);
    fetch(`${STAFF_BASE}/api_orders.php`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const parsed = data.map(order => ({
            ...order,
            items:
              typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items || [],
          }));
          setOrders(parsed);
        } else {
          setOrders([]);
        }
        setLastRefreshed(new Date());
      })
      .catch(() => setOrders([]))
      .finally(() => { if (!silent) setLoading(false); });
  };

  // Initial load + polling
  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  /* =========================
     FILTER + SORT
  ========================= */
  const displayedOrders = orders
    .filter(order => {
      const matchesFilter = statusFilter === "All" || order.status === statusFilter;
      const query = searchId.trim();
      const matchesSearch = !query || String(order.id).includes(query);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === "Highest total") return Number(b.total) - Number(a.total);
      const dateA = a.created_at ? new Date(a.created_at).getTime() : Number(a.id);
      const dateB = b.created_at ? new Date(b.created_at).getTime() : Number(b.id);
      if (sortOption === "Oldest") return dateA - dateB;
      return dateB - dateA;
    });

  /* =========================
     UPDATE STATUS
  ========================= */
  const getNextStatus = status => {
    const steps = ["Pending", "Preparing", "To Receive"];
    const idx = steps.indexOf(status);
    return idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] :
           status === "Preparing" ? "To Receive" :
           status === "Pending"   ? "Preparing"  : null;
  };

  // Rebuild: staff can advance Pending→Preparing→To Receive only
  // Completed is set by customer; Cancelled is set by customer
  const canAdvance = (status) => {
    return status === "Pending" || status === "Preparing";
  };

  const updateStatus = (id, status) => {
    setUpdatingId(id);
    fetch(`${STAFF_BASE}/api_update_order_status.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          fetchOrders(true);
          if (status === "To Receive") {
            if (data.sms_sent) {
              addToast(`✓ Order #${id} updated — SMS sent to customer`, "success");
            } else {
              addToast(
                `Order #${id} updated, but SMS failed: ${data.sms_error ?? "Unknown error"}`,
                "sms_fail"
              );
            }
          } else {
            addToast(`Order #${id} → ${status}`, "success");
          }
        } else {
          addToast(`Update failed: ${data.message}`, "error");
        }
      })
      .catch(() => addToast("Network error — could not update order.", "error"))
      .finally(() => setUpdatingId(null));
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">

      <StaffNavbar />
      <Toast toasts={toasts} />

      <div className="p-8 xl:p-10">

        {/* HEADER */}
        <div className="mb-10 pt-20 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Staff Control Panel
            </p>
            <h1 className="text-3xl font-bold">Orders Management</h1>
          </div>
          {/* Refresh + last updated */}
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <p className="text-[10px] text-gray-400">
                Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            <button
              onClick={() => fetchOrders()}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:border-black hover:text-black transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-8 grid gap-3 lg:grid-cols-[1fr_auto] items-center">
          <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map(option => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  statusFilter === option
                    ? option === "Cancelled"
                      ? "border-red-400 bg-red-500 text-white"
                      : "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="Search Order ID"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-black"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Sort By:</span>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ORDERS GRID */}
        {loading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">No orders found.</p>
        ) : displayedOrders.length === 0 ? (
          <p className="text-gray-400">No orders match your search or filter.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedOrders.map(order => {
              const isCancelled  = order.status === "Cancelled";
              const isCompleted  = order.status === "Completed";
              const isToReceive  = order.status === "To Receive";

              return (
                <motion.div
                  key={order.id}
                  whileHover={{ y: (isCancelled || isCompleted) ? 0 : -4 }}
                  className={`bg-white rounded-[25px] p-6 shadow-lg border transition-all ${
                    isCancelled ? "border-red-100 opacity-60" :
                    isCompleted ? "border-green-100 opacity-75" :
                    "border-gray-100"
                  }`}
                >
                  {/* HEADER */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Order ID</p>
                      <h2 className="font-bold">#{order.id}</h2>
                      {order.created_at && (
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString([], {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-[10px] rounded-full h-fit ${statusColors[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="mb-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name} x{item.qty}</span>
                        <span>₱{(Number(item.price) * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="border-t pt-3 flex justify-between font-semibold mb-4">
                    <span>Total</span>
                    <span className={
                      isCancelled ? "text-red-400 line-through" :
                      isCompleted ? "text-green-500" :
                      "text-[#d4af37]"
                    }>
                      ₱{Number(order.total).toLocaleString()}
                    </span>
                  </div>

                  {/* ACTION AREA */}
                  {isCancelled ? (
                    <div className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-400 text-center">
                      Cancelled by customer
                    </div>

                  ) : isCompleted ? (
                    <div className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-600 text-center font-medium">
                      ✓ Completed by customer
                    </div>

                  ) : isToReceive ? (
                    <div className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-600 text-center">
                      Waiting for customer to confirm receipt
                    </div>

                  ) : canAdvance(order.status) ? (
                    <button
                      onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                      disabled={updatingId === order.id}
                      className={`w-full rounded-full px-4 py-2 text-sm text-white transition
                        ${updatingId === order.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:bg-gray-800"}`}
                    >
                      {updatingId === order.id
                        ? "Updating…"
                        : `Advance to ${getNextStatus(order.status)}`}
                    </button>

                  ) : null}

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
