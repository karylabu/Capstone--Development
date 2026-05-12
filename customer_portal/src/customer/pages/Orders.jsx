import React, { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("http://localhost/pastry_system/customer/api_get_orders.php");
        const data = await res.json();

        if (Array.isArray(data)) {
          const parsedOrders = data.map(order => ({
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

    loadOrders();

    // Listen for live updates after placing an order
    window.addEventListener("ordersUpdated", loadOrders);
    return () => window.removeEventListener("ordersUpdated", loadOrders);
  }, []);

  const statusSteps = ["Pending", "Preparing", "To Receive", "Completed"];
  const getStatusStyle = status => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Preparing": return "bg-blue-100 text-blue-700";
      case "To Receive": return "bg-purple-100 text-purple-700";
      case "Completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 xl:p-10">
      {/* HEADER */}
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">
          Track your purchases
        </p>
        <h1 className="text-[34px] tracking-tight text-black">My Orders</h1>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[28px] p-10 text-center shadow-sm">
          <p className="text-gray-400 text-[14px]">No orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order, idx) => {
            const currentStep = statusSteps.indexOf(order.status);

            return (
              <div key={idx} className="border border-gray-100 rounded-[28px] p-6 bg-white shadow-sm hover:shadow-md flex flex-col">
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
                    const sel = Array.isArray(item.selectionDetails) || !item.selectionDetails ? {} : item.selectionDetails;

                    return (
                      <div key={i} className="flex flex-col bg-gray-50 rounded-[24px] p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700 text-[11px] truncate pr-2">{item.name} x{item.qty}</span>
                          <span className="text-black text-[11px]">₱{(Number(item.price) * item.qty).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sel.drink && <span className="text-[9px] px-2 py-1 bg-blue-50 text-blue-500 rounded-full">{sel.drink}</span>}
                          {sel.cake && <span className="text-[9px] px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full">{sel.cake}</span>}
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
                  <span className="text-[15px] text-[#d4af37] font-semibold">₱{Number(order.total).toLocaleString()}</span>
                </div>

                {/* STATUS TRACKER */}
                <div>
                  <div className="flex justify-between text-[6px] uppercase tracking-[0.12em] text-gray-400 mb-1">
                    {statusSteps.map(step => <span key={step}>{step}</span>)}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {statusSteps.map((step, idx) => (
                      <div key={step} className={`h-[6px] rounded-full transition-all ${idx <= currentStep ? "bg-[#d4af37]" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}