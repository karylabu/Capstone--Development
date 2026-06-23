import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { CUSTOMER_BASE, STAFF_BASE } from "../../services/config";

export default function Orders() {

  const [orders, setOrders] = useState([]);

  const normalizeOrders = (items, source) =>
    (Array.isArray(items) ? items : []).map((order) => ({
      ...order,
      source,
      items:
        typeof order.items === "string" && order.items.length
          ? JSON.parse(order.items)
          : order.items || [],
    }));

  // FETCH ORDERS
  const fetchOrders = () => {
    Promise.all([
      fetch(`${CUSTOMER_BASE}/api_orders.php?action=list`).then((res) => res.json()).catch(() => []),
      fetch(`${STAFF_BASE}/api_orders.php`).then((res) => res.json()).catch(() => []),
    ])
      .then(([customerOrders, staffOrders]) => {
        const combined = [
          ...normalizeOrders(customerOrders, "Customer"),
          ...normalizeOrders(staffOrders, "Staff"),
        ].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : Number(a.id);
          const dateB = b.created_at ? new Date(b.created_at).getTime() : Number(b.id);
          return dateB - dateA;
        });
        setOrders(combined);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {

    fetchOrders();

    const handleOrdersUpdated = () => fetchOrders();
    window.addEventListener('orderPlaced', handleOrdersUpdated);
    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('orderPlaced', handleOrdersUpdated);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };

  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      const order = orders.find((o) => o.id === id);
      const isStaffOrder = order?.source === "Staff";
      const endpoint = isStaffOrder
        ? `${STAFF_BASE}/api_update_order_status.php`
        : `${CUSTOMER_BASE}/api_orders.php?action=update_status`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        );
        window.dispatchEvent(new Event("ordersUpdated"));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (

    <div className="min-h-screen bg-[#f7f7f7] font-['DM_Sans']">

      <AdminNavbar />

      <main className="px-6 md:px-10 py-14">

        <div className="max-w-[1400px] mx-auto">

          {/* HEADER */}
          <div className="mb-14">

            <p className="text-gold text-[10px] font-black tracking-[0.3em] uppercase mb-2">
              Admin Panel
            </p>

            <h1 className="text-5xl font-black text-gray-900">
              Orders
            </h1>

          </div>

          {/* TABLE */}
          <div className="overflow-x-auto bg-white rounded-[30px] border border-gray-100 shadow-lg">

            <table className="w-full">

              <thead className="bg-black text-white">

                <tr>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    ID
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Customer
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Method
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Total
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Status
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Source
                  </th>

                  <th className="px-6 py-5 text-left text-[11px] uppercase tracking-[0.2em]">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders.length > 0 ? (

                  orders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >

                      {/* ID */}
                      <td className="px-6 py-5 font-bold">
                        #{order.id}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-5">
                        {order.phone || "No Customer"}
                      </td>

                      {/* METHOD */}
                      <td className="px-6 py-5">

                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase
                          ${order.method === "Deliver"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"}
                        `}>

                          {order.method}

                        </span>

                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-5 font-black">
                        ₱{Number(order.total).toLocaleString()}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">

                        <select
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          className="px-4 py-2 rounded-xl border border-gray-200 text-[11px] font-black uppercase outline-none bg-white"
                        >

                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Preparing">
                            Preparing
                          </option>

                          <option value="To Receive">
                            To Receive
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                        </select>

                      </td>

                      {/* SOURCE */}
                      <td className="px-6 py-5 text-sm uppercase tracking-[0.1em] text-gray-500">
                        {order.source || "Customer"}
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5">
                        {order.created_at || "No Date"}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      No orders found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>

  );

}