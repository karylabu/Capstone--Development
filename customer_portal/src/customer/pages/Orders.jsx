import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, PackageCheck } from "lucide-react";
import { CUSTOMER_BASE } from "../../services/config";

// ── Cancel Confirmation Dialog ───────────────────────────────────────────────
function CancelDialog({ order, onConfirm, onDismiss, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl font-['DM_Sans']"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle size={26} className="text-red-400" strokeWidth={1.8} />
        </div>
        <h3 className="text-[20px] font-black text-gray-900 text-center leading-tight mb-2">
          Cancel Order #{order.id}?
        </h3>
        <p className="text-[12px] text-gray-400 text-center leading-relaxed mb-8">
          This action cannot be undone. Your pending order will be permanently cancelled.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-4 rounded-[20px] border border-gray-200 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition-all"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-4 rounded-[20px] bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {isLoading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Order Received Confirmation Dialog ───────────────────────────────────────
function ReceivedDialog({ order, onConfirm, onDismiss, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl font-['DM_Sans']"
      >
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-6 mx-auto">
          <PackageCheck size={26} className="text-green-500" strokeWidth={1.8} />
        </div>
        <h3 className="text-[20px] font-black text-gray-900 text-center leading-tight mb-2">
          Confirm Receipt?
        </h3>
        <p className="text-[12px] text-gray-400 text-center leading-relaxed mb-8">
          Confirm that you have received Order #{order.id}. This will mark it as <span className="text-green-600 font-bold">Completed</span>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-4 rounded-[20px] border border-gray-200 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 transition-all"
          >
            Not Yet
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-4 rounded-[20px] bg-green-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-green-600 transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {isLoading ? "Confirming…" : "Yes, Received!"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders]           = useState([]);
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [receivedTarget, setReceivedTarget] = useState(null);
  const [processingId, setProcessingId]   = useState(null);
  const [actionError, setActionError]     = useState(null);

  const loadOrders = async () => {
    try {
      const res = await fetch(`${CUSTOMER_BASE}/api_get_orders.php`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const parsedOrders = data.map((order) => ({
          ...order,
          items:
            typeof order.items === "string" && order.items.length
              ? JSON.parse(order.items)
              : order.items || [],
        }));
        setOrders(parsedOrders);
        localStorage.setItem("customer_orders", JSON.stringify(parsedOrders));
      } else {
        const savedOrders = JSON.parse(localStorage.getItem("customer_orders")) || [];
        setOrders(savedOrders);
      }
    } catch {
      const savedOrders = JSON.parse(localStorage.getItem("customer_orders")) || [];
      setOrders(savedOrders);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener("ordersUpdated", loadOrders);

    // Auto-refresh orders every 5 seconds while there are pending/preparing orders
    const pollInterval = setInterval(() => {
      setOrders((prev) => {
        const hasActiveOrders = prev.some(
          (o) => o.status === "Pending" || o.status === "Preparing" || o.status === "To Receive"
        );
        if (hasActiveOrders) {
          loadOrders();
        }
        return prev;
      });
    }, 5000);

    return () => {
      window.removeEventListener("ordersUpdated", loadOrders);
      clearInterval(pollInterval);
    };
  }, []);

  // ── Cancel handler ──────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setProcessingId(cancelTarget.id);
    setActionError(null);
    try {
      const res = await fetch(`${CUSTOMER_BASE}/api_cancel_order.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: cancelTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        updateLocalStatus(cancelTarget.id, "Cancelled");
      } else {
        setActionError(data.message || "Failed to cancel order.");
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setProcessingId(null);
      setCancelTarget(null);
    }
  };

  // ── Order Received handler ──────────────────────────────────────────────────
  const handleReceivedConfirm = async () => {
    if (!receivedTarget) return;
    setProcessingId(receivedTarget.id);
    setActionError(null);
    try {
      const res = await fetch(`${CUSTOMER_BASE}/api_confirm_received.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: receivedTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        updateLocalStatus(receivedTarget.id, "Completed");
      } else {
        setActionError(data.message || "Failed to confirm order.");
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setProcessingId(null);
      setReceivedTarget(null);
    }
  };

  // ── Optimistic local update ─────────────────────────────────────────────────
  const updateLocalStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    const updated = JSON.parse(localStorage.getItem("customer_orders") || "[]").map(
      (o) => (o.id === id ? { ...o, status: newStatus } : o)
    );
    localStorage.setItem("customer_orders", JSON.stringify(updated));
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const statusSteps = ["Pending", "Preparing", "To Receive", "Completed"];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":    return "bg-yellow-100 text-yellow-700";
      case "Preparing":  return "bg-blue-100 text-blue-700";
      case "To Receive": return "bg-purple-100 text-purple-700";
      case "Completed":  return "bg-green-100 text-green-700";
      case "Cancelled":  return "bg-red-100 text-red-500";
      default:           return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      <div className="p-6 xl:p-10">
        {/* HEADER */}
        <div className="mb-7">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">
            Track your purchases
          </p>
          <h1 className="text-[34px] tracking-tight text-black">My Orders</h1>
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-5 py-3"
            >
              <p className="text-[12px] text-red-500 font-semibold">{actionError}</p>
              <button onClick={() => setActionError(null)} className="text-red-300 hover:text-red-500">
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[28px] p-10 text-center shadow-sm">
            <p className="text-gray-400 text-[14px]">No orders yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order, idx) => {
              const isCancelled  = order.status === "Cancelled";
              const isPending    = order.status === "Pending";
              const isToReceive  = order.status === "To Receive";
              const isCompleted  = order.status === "Completed";
              const currentStep  = statusSteps.indexOf(order.status);

              return (
                <motion.div
                  key={order.id ?? idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isCancelled ? 0.55 : 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`border rounded-[28px] p-6 bg-white flex flex-col transition-shadow ${
                    isCancelled
                      ? "border-red-100 shadow-none"
                      : "border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* ORDER HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mb-1">Order ID</p>
                      <h2 className="text-[14px] text-black font-semibold">#{order.id}</h2>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] uppercase tracking-[0.15em] ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="mb-4 space-y-3 max-h-48 overflow-y-auto pr-2">
                    {order.items?.map((item, i) => {
                      const sel =
                        Array.isArray(item.selectionDetails) || !item.selectionDetails
                          ? {}
                          : item.selectionDetails;
                      return (
                        <div key={i} className="flex flex-col bg-gray-50 rounded-[24px] p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 text-[11px] truncate pr-2">
                              {item.name} x{item.qty}
                            </span>
                            <span className="text-black text-[11px]">
                              ₱{(Number(item.price) * item.qty).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {sel.drink && <span className="text-[9px] px-2 py-1 bg-blue-50 text-blue-500 rounded-full">{sel.drink}</span>}
                            {sel.cake  && <span className="text-[9px] px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full">{sel.cake}</span>}
                            {sel.extras?.map((e, j) => <span key={j} className="text-[9px] px-2 py-1 bg-green-50 text-green-600 rounded-full">{e.name}</span>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ADDRESS */}
                  {order.address && (
                    <div className="mb-2">
                      <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mb-1">Address</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{order.address}</p>
                    </div>
                  )}

                  {/* PAYMENT & METHOD */}
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mb-1">Payment</p>
                      <p className="text-[11px] text-black">{order.payment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mb-1">Method</p>
                      <p className="text-[11px] text-black">{order.method}</p>
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="border-t border-gray-100 pt-2 mb-3 flex justify-between">
                    <span className="text-[11px] text-gray-500">Total</span>
                    <span className="text-[15px] text-[#d4af37] font-semibold">
                      ₱{Number(order.total).toLocaleString()}
                    </span>
                  </div>

                  {/* STATUS TRACKER */}
                  {!isCancelled ? (
                    <div className="mb-4">
                      <div className="flex justify-between text-[6px] uppercase tracking-[0.12em] text-gray-400 mb-1">
                        {statusSteps.map((step) => <span key={step}>{step}</span>)}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {statusSteps.map((step, i) => (
                          <div
                            key={step}
                            className={`h-[6px] rounded-full transition-all ${
                              i <= currentStep ? "bg-[#d4af37]" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 py-2 px-3 bg-red-50 rounded-2xl">
                      <p className="text-[10px] text-red-400 font-semibold text-center uppercase tracking-widest">
                        Order Cancelled
                      </p>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2 mt-auto">

                    {/* Order Received — only for "To Receive" */}
                    {isToReceive && (
                      <button
                        onClick={() => setReceivedTarget(order)}
                        disabled={processingId === order.id}
                        className="w-full py-3 rounded-[18px] bg-green-500 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-green-600 transition-all active:scale-[0.98] disabled:opacity-40 shadow-md shadow-green-100"
                      >
                        {processingId === order.id ? "Confirming…" : "✓ Order Received"}
                      </button>
                    )}

                    {/* Completed label */}
                    {isCompleted && (
                      <div className="w-full py-3 rounded-[18px] border border-green-200 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[0.25em] text-center">
                        ✓ Completed
                      </div>
                    )}

                    {/* Cancel — only for "Pending" */}
                    {isPending && (
                      <button
                        onClick={() => setCancelTarget(order)}
                        disabled={processingId === order.id}
                        className="w-full py-3 rounded-[18px] border border-red-200 text-red-400 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all active:scale-[0.98] disabled:opacity-40"
                      >
                        {processingId === order.id ? "Cancelling…" : "Cancel Order"}
                      </button>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCEL DIALOG */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelDialog
            order={cancelTarget}
            onConfirm={handleCancelConfirm}
            onDismiss={() => setCancelTarget(null)}
            isLoading={processingId === cancelTarget?.id}
          />
        )}
      </AnimatePresence>

      {/* ORDER RECEIVED DIALOG */}
      <AnimatePresence>
        {receivedTarget && (
          <ReceivedDialog
            order={receivedTarget}
            onConfirm={handleReceivedConfirm}
            onDismiss={() => setReceivedTarget(null)}
            isLoading={processingId === receivedTarget?.id}
          />
        )}
      </AnimatePresence>
    </>
  );
}
