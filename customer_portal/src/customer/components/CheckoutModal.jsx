import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BASE, CUSTOMER_BASE } from '../../services/config';

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

  /* =========================
     MAP INITIALIZATION
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    if (checkoutData.method === "Deliver") {
      let mapInstance = mapRef.current;

      // CREATE MAP IF NOT EXISTS
      if (!mapInstance) {
        mapInstance = L.map("checkout-map").setView(
          [13.7565, 121.0583],
          12
        );

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          }
        ).addTo(mapInstance);

        const marker = L.marker([13.7565, 121.0583], {
          draggable: true,
        }).addTo(mapInstance);

        // REVERSE GEOCODING FUNCTION
        const reverseGeocode = async (lat, lng) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'PastryShop/1.0'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          }
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        };

        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          const lat = pos.lat;
          const lng = pos.lng;

          // GET ADDRESS VIA REVERSE GEOCODING
          const address = await reverseGeocode(lat, lng);

          setCheckoutData((prev) => ({
            ...prev,
            lat: lat,
            lng: lng,
            address: address,
          }));
        });

        mapRef.current = mapInstance;

        // INITIAL REVERSE GEOCODING FOR DEFAULT LOCATION
        reverseGeocode(13.7565, 121.0583).then((address) => {
          setCheckoutData((prev) => ({
            ...prev,
            address: address,
            lat: 13.7565,
            lng: 121.0583,
          }));
        });
      }

      // FIX SIZE AFTER SWITCHING TO DELIVER
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // REMOVE MAP WHEN SWITCHING AWAY FROM DELIVER
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  }, [isOpen, checkoutData.method]);

  /* =========================
     CLEANUP MAP ON MODAL CLOSE
  ========================= */
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [isOpen]);

  /* =========================
     GROUP ITEMS
  ========================= */
  const groupedItems = useMemo(() => {
    const grouped = {};

    cartItems.forEach((item) => {
      const key = JSON.stringify({
        name: item.name,
        variant: item.variant,
        selectionDetails: item.selectionDetails || {},
      });

      if (!grouped[key]) {
        grouped[key] = { ...item, qty: 1 };
      } else {
        grouped[key].qty += 1;
      }
    });

    return Object.values(grouped);
  }, [cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const deliveryFee =
    checkoutData.method === "Deliver" && cartItems.length > 0
      ? 45
      : 0;

  const total = subtotal + deliveryFee;

  /* =========================
     PLACE ORDER
  ========================= */
  const handlePlaceOrder = async () => {

    if (!checkoutData.phone) {
      alert("Please enter your phone number.");
      return;
    }

    // FIX: Validate GCash number format (must be 09XXXXXXXXX, 11 digits)
    if (checkoutData.payment === "GCash") {
      const gcashRegex = /^09\d{9}$/;
      if (!gcashRegex.test(checkoutData.phone)) {
        alert("Please enter a valid GCash number (e.g. 09XXXXXXXXX).");
        return;
      }
    }

    if (
      !checkoutData.address &&
      checkoutData.method === "Deliver"
    ) {
      alert("Please enter your delivery address.");
      return;
    }

    setLoading(true);

    try {

      const savedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "{}") || {};
        } catch {
          return {};
        }
      })();

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

        user_id: savedUser.id || 0, // Include user_id for proper order association
        customer: savedUser.name || "",
        email: savedUser.email || "",

        method: checkoutData.method,
        payment: checkoutData.payment,
        address: checkoutData.address,
        phone: checkoutData.phone,

        latitude: checkoutData.lat,
        longitude: checkoutData.lng,
      };

      /* =========================
        SAVE ORDER
      ========================= */

      const orderUrl = `${CUSTOMER_BASE}/api_orders.php`;
      console.log("Placing order to", orderUrl, payload);
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const xsrf = getCookie('XSRF-TOKEN');

      const response = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
        },
        body: JSON.stringify(payload),
      });

      let result;
      if (!response.ok) {
        const text = await response.text();
        console.error('Order API returned non-OK:', response.status, text);
        alert(`Order failed: ${response.status} - ${text}`);
        return;
      }

      try {
        result = await response.json();
      } catch (parseErr) {
        const text = await response.text().catch(() => '<no body>');
        console.error('Failed to parse JSON from order API:', parseErr, text);
        alert(`Server returned invalid response: ${text}`);
        return;
      }

      console.log('Order API result:', result);

      if (result.status !== "success") {
        alert(result.message || "Order failed.");
        return;
      }

      /* =========================
         PAYMONGO FLOW
      ========================= */

      if (checkoutData.payment === "GCash") {

        const paymentResponse = await fetch(
          `${CUSTOMER_BASE}/create_payment.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
            },
            body: JSON.stringify({
              order_id: result.order_id,
              amount: total,
              payment_method: checkoutData.payment,
            }),
          }
        );

        if (!paymentResponse.ok) {
          let errMsg = "PayMongo payment creation failed.";
          try {
            const err = await paymentResponse.json();
            // FIX: PayMongo error shape is err.errors[0].detail, not err.error
            errMsg =
              err?.errors?.[0]?.detail ||
              err?.error ||
              err?.message ||
              JSON.stringify(err);
          } catch (e) {}
          alert(errMsg);
          return;
        }

        const paymentData = await paymentResponse.json();

        console.log('PayMongo response:', paymentData);

        const checkoutUrl = paymentData?.data?.attributes?.checkout_url;
        if (!checkoutUrl) {
          alert("Payment URL not returned by PayMongo.");
          return;
        }

        // FIX: Clear cart AFTER we have a valid checkout URL, right before redirect.
        // Previously the cart was cleared before the URL check, so a missing URL
        // would wipe the cart with no payment made.
        setCartItems([]);

        // REDIRECT TO PAYMONGO
        window.location.href = checkoutUrl;

        return;
      }

      /* =========================
         COD FLOW
      ========================= */

      setCartItems([]);

      onOrderPlaced(result.order_id, checkoutData);

      onClose();

    } catch (err) {

      console.error('Place order error:', err);
      const msg = (err && err.message) ? err.message : String(err);
      alert(`Server error: ${msg}`);

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

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X size={18} />
          </button>

          {/* LEFT SIDE */}
          <div className="flex-1 p-8 overflow-y-auto relative z-50 pointer-events-auto">

            <h2 className="text-lg font-normal text-gray-800 mb-6">
              Delivery Details
            </h2>

            {/* METHOD */}
            <div className="mb-6 space-y-2">

              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Order Method
              </p>

              <div className="flex gap-2">

                {["Deliver", "Pickup"].map((m) => (

                  <button
                    key={m}
                    onClick={() =>
                      setCheckoutData({
                        ...checkoutData,
                        method: m,
                      })
                    }
                    className={`flex-1 py-2 rounded-xl border text-[11px]
                    ${
                      checkoutData.method === m
                        ? "bg-black text-white"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {m}
                  </button>

                ))}

              </div>

            </div>

            {/* PAYMENT */}
            <div className="mb-6 space-y-2">

              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Payment Method
              </p>

              <div className="flex gap-2">
                {["COD", "GCash"].map((paymentOption) => (
                  <button
                    key={paymentOption}
                    onClick={() =>
                      setCheckoutData({
                        ...checkoutData,
                        payment: paymentOption,
                      })
                    }
                    className={`flex-1 py-2 rounded-xl border text-[11px]
                    ${
                      checkoutData.payment === paymentOption
                        ? "bg-black text-white"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {paymentOption}
                  </button>
                ))}
              </div>

            </div>

            {/* CONTACT INFO */}
            <div className="space-y-3 relative z-50 pointer-events-auto">

              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Contact Info
              </p>

              {checkoutData.method === "Deliver" && (
                <>

                  {/* ADDRESS */}
                  <input
                    type="text"
                    placeholder="Address"
                    autoComplete="street-address"
                    className="w-full p-3 bg-gray-50 rounded-xl text-[11px] outline-none relative z-[9999] pointer-events-auto"
                    value={checkoutData.address}
                    onClick={(e) => e.currentTarget.focus()}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        address: e.target.value,
                      })
                    }
                  />

                  {/* MAP */}
                  <div
                    id="checkout-map"
                    className="w-full h-48 rounded-xl border bg-gray-100 mt-2 overflow-hidden"
                  />

                </>
              )}

              {/* PHONE */}
              <input
                type="tel"
                autoComplete="tel"
                placeholder={
                  checkoutData.payment === "GCash"
                    ? "GCash Number (09XXXXXXXXX)"
                    : "Phone Number"
                }
                className="w-full p-3 bg-gray-50 rounded-xl text-[11px] outline-none relative z-[9999] pointer-events-auto"
                value={checkoutData.phone}
                onClick={(e) => e.currentTarget.focus()}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    phone: e.target.value,
                  })
                }
              />

              {checkoutData.payment === "GCash" && (
                <p className="text-[9px] text-gray-500 mt-2">
                  Enter your GCash number (09XXXXXXXXX) to receive a payment link.
                </p>
              )}

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="w-[300px] bg-gray-50 p-8 border-l flex flex-col">

            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
              Summary
            </p>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto space-y-4">

              {groupedItems.map((item, idx) => {

                const sel =
                  Array.isArray(item.selectionDetails) ||
                  !item.selectionDetails
                    ? {}
                    : item.selectionDetails;

                return (

                  <div key={idx} className="flex gap-3">

                    <img
                      src={`${BASE}/uploads/${item.image}`}
                      className="w-10 h-10 rounded-lg object-cover"
                      alt=""
                    />

                    <div className="flex-1">

                      <p className="text-[11px] font-normal leading-tight">
                        {item.name} x{item.qty}
                      </p>

                      {sel.drink && (
                        <p className="text-[9px] text-blue-500">
                          {sel.drink}
                        </p>
                      )}

                      {sel.cake && (
                        <p className="text-[9px] text-yellow-600">
                          {sel.cake}
                        </p>
                      )}

                      {sel.extras?.length > 0 && (
                        <p className="text-[9px] text-green-600">
                          +{sel.extras
                            .map((e) => e.name)
                            .join(", ")}
                        </p>
                      )}

                    </div>

                    <span className="text-[11px]">
                      ₱{item.price * item.qty}
                    </span>

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

              {/* PLACE ORDER BUTTON */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-black text-white text-[11px] rounded-2xl mt-4 tracking-widest transition active:scale-95 disabled:bg-gray-300"
              >
                {loading
                  ? checkoutData.payment === "GCash"
                    ? "REDIRECTING..."
                    : "SAVING..."
                  : "PLACE ORDER"}
              </button>

            </div>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>
  );
}
