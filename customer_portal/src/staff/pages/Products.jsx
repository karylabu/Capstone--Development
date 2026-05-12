import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffNavbar from "../components/StaffNavbar";

const BASE = "http://localhost/GitHub/Capstone--Development";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState("");
  const [updateError, setUpdateError] = useState(null);

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = () => {

    setLoading(true);
    setFetchError(null);

    fetch(`${BASE}/staff/api_products.php?action=list`)
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setFetchError("Invalid server response.");
          setProducts([]);
        }

      })
      .catch(err => {
        setFetchError("Cannot connect to server.");
        setProducts([]);
      })
      .finally(() => setLoading(false));

  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     UPDATE STOCK
  ========================= */
  const updateStock = (type) => {

    const parsed = Number(qty);

    if (!qty || parsed <= 0) {
      setUpdateError("Enter a valid quantity.");
      return;
    }

    fetch(`${BASE}/staff/api_update_stock.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedProduct.id,
        qty: parsed,
        type
      })
    })
      .then(res => res.json())
      .then(data => {

        if (data.status === "success") {
          fetchProducts();
          setSelectedProduct(null);
          setQty("");
        } else {
          setUpdateError("Update failed.");
        }

      })
      .catch(() => setUpdateError("Server error"));

  };

  /* =========================
     STOCK COLORS
  ========================= */
  const getStockColor = (stock) => {
    if (!stock || stock <= 0) return "text-red-500 bg-red-50";
    if (stock <= 5) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <StaffNavbar />

      <div className="p-6 xl:p-10 pt-24">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">
            Inventory Control
          </p>
          <h1 className="text-4xl font-extrabold text-gray-800">
            Products Management
          </h1>
        </div>

        {/* ERROR */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {fetchError}
            <button
              onClick={fetchProducts}
              className="ml-3 underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500">Loading products...</p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {!loading && products.map(product => (

            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
            >

              {/* IMAGE */}
              <div className="h-40 bg-gray-100 overflow-hidden">
                <img
                  src={`${BASE}/uploads/${product.image}`}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  alt={product.name}
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">

                <h2 className="font-bold text-lg text-gray-800">
                  {product.name}
                </h2>

                <p className="text-xs text-gray-400 mb-3">
                  {product.category}
                </p>

                {/* STOCK BADGE */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getStockColor(product.stock)}`}>
                  Stock: {product.stock ?? 0}
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setQty("");
                  }}
                  className="w-full bg-black text-white py-2 rounded-xl text-xs tracking-widest hover:bg-gray-800 transition"
                >
                  MANAGE STOCK
                </button>

              </div>

            </motion.div>

          ))}

        </div>

        {/* =========================
            MODAL
        ========================= */}
        <AnimatePresence>

          {selectedProduct && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            >

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white w-[360px] rounded-2xl p-6 shadow-xl"
              >

                <h2 className="text-xl font-bold mb-1">
                  {selectedProduct.name}
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Current Stock: {selectedProduct.stock ?? 0}
                </p>

                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full border rounded-xl p-3 mb-3 outline-none focus:ring-2 focus:ring-black"
                />

                {updateError && (
                  <p className="text-red-500 text-xs mb-3">
                    {updateError}
                  </p>
                )}

                {/* ACTIONS */}
                <div className="flex gap-2">

                  <button
                    onClick={() => updateStock("in")}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm hover:bg-green-600"
                  >
                    Stock In
                  </button>

                  <button
                    onClick={() => updateStock("out")}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600"
                  >
                    Stock Out
                  </button>

                </div>

                {/* CLOSE */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="mt-4 text-xs text-gray-500 w-full hover:text-gray-700"
                >
                  Cancel
                </button>

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>

  );

}