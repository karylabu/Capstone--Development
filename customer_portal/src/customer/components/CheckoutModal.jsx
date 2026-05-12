import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker icon images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  setCartItems,
  onOrderPlaced,
}) {
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    method: "Deliver",
    payment: "COD",
    address: "",
    phone: "",
    lat: null,
    lng: null,
  });

  const mapRef = useRef(null);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (!isOpen || checkoutData.method !== "Deliver") return;

    if (!mapRef.current) {
      const map = L.map("checkout-map", {
        center: [13.7565, 121.0583],
        zoom: 12,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      const marker = L.marker([13.7565, 121.0583], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCheckoutData((prev) => ({ ...prev, lat: pos.lat, lng: pos.lng }));
      });

      setTimeout(() => map.invalidateSize(), 200);

      return () => map.remove();
    } else {
      mapRef.current.invalidateSize();
    }
  }, [isOpen, checkoutData.method]);

  // --- GROUP ITEMS ---
  const groupedItems = useMemo(() => {
    const grouped = {};
    cartItems.forEach((item) => {
      const key = JSON.stringify({
        name: item.name,
        variant: item.variant,
        selectionDetails: item.selectionDetails || {},
      });
      if (!grouped[key]) grouped[key] = { ...item, qty: 1 };
      else grouped[key].qty += 1;
    });
    return Object.values(grouped);
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const deliveryFee = checkoutData.method === "Deliver" && cartItems.length > 0 ? 45 : 0;
  const total = subtotal + deliveryFee;

  // --- PLACE ORDER ---
  const handlePlaceOrder = async () => {
    if (!checkoutData.phone) {
      alert("Please enter your phone number.");
      return;
    }
    if (!checkoutData.address && checkoutData.method === "Deliver") {
      alert("Please enter your delivery address.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: groupedItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          selectionDetails: item.selectionDetails || {},
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        method: checkoutData.method,
        payment: checkoutData.payment,
        address: checkoutData.address,
        phone: checkoutData.phone,
        latitude: checkoutData.lat,
        longitude: checkoutData.lng,
      };

      const response = await fetch("http://localhost/pastry_system/customer/api_orders.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status === "success") {
        setCartItems([]);
        onOrderPlaced(result.order_id, checkoutData);
        onClose();
      } else {
        alert(result.message || "Order failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center p-2 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-[800px] h-[550px] bg-white rounded-[30px] flex font-['DM_Sans'] overflow-hidden shadow-2xl"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X size={18} />
          </button>

          {/* LEFT: FORM */}
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-lg font-normal text-gray-800 mb-6">Delivery Details</h2>

            {/* Method */}
            <div className="mb-6 space-y-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Order Method</p>
              <div className="flex gap-2">
                {["Deliver", "Pickup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCheckoutData({ ...checkoutData, method: m })}
                    className={`flex-1 py-2 rounded-xl border text-[11px] ${
                      checkoutData.method === m ? "bg-black text-white" : "bg-white text-gray-500"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Address & Phone */}
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Contact Info</p>
              {checkoutData.method === "Deliver" && (
                <>
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full p-3 bg-gray-50 rounded-xl text-[11px] outline-none"
                    value={checkoutData.address}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, address: e.target.value })
                    }
                  />
                  <div
                    id="checkout-map"
                    className="w-full h-48 rounded-xl border bg-gray-100 mt-2 overflow-hidden"
                  />
                </>
              )}
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-3 bg-gray-50 rounded-xl text-[11px] outline-none"
                value={checkoutData.phone}
                onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="w-[300px] bg-gray-50 p-8 border-l flex flex-col">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">Summary</p>
            <div className="flex-1 overflow-y-auto space-y-4">
              {groupedItems.map((item, idx) => {
                const sel =
                  Array.isArray(item.selectionDetails) || !item.selectionDetails
                    ? {}
                    : item.selectionDetails;
                return (
                  <div key={idx} className="flex gap-3">
                    <img
                      src={`http://localhost/pastry_system/uploads/${item.image}`}
                      className="w-10 h-10 rounded-lg object-cover"
                      alt=""
                    />
                    <div className="flex-1">
                      <p className="text-[11px] font-normal leading-tight">
                        {item.name} x{item.qty}
                      </p>
                      {sel.drink && <p className="text-[9px] text-blue-500">{sel.drink}</p>}
                      {sel.cake && <p className="text-[9px] text-yellow-600">{sel.cake}</p>}
                      {sel.extras?.length > 0 && (
                        <p className="text-[9px] text-green-600">
                          +{sel.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px]">₱{item.price * item.qty}</span>
                  </div>
                );
              })}
            </div>

            {/* TOTALS */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Delivery</span>
                <span>₱{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-[14px] pt-2">
                <span>Total</span>
                <span>₱{total}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-black text-white text-[11px] rounded-2xl mt-4 tracking-widest transition active:scale-95 disabled:bg-gray-300"
              >
                {loading ? "SAVING..." : "PLACE ORDER"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}