import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './Navbar';

import Dashboard from '../pages/Dashboard';
import Menu from '../pages/Menu';
import Orders from '../pages/Orders';

import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';

export default function CustomerApp() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  /* =========================
     ADD TO CART
  ========================= */
  const addToCart = (product) => {
    const newItem = {
      ...product,
      id: Date.now(),
      qty: 1,
      price:
        Number(product.price) ||
        Number(product.basePrice) ||
        Number(product.small_price) ||
        Number(product.big_price) ||
        0,
    };

    setCartItems((prev) => [newItem, ...prev]);

    setToastMessage('Added to cart');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  /* =========================
     PLACE ORDER
  ========================= */
  const handleOrderPlaced = (order_id, checkoutData) => {
    setCartItems([]);

    // Show toast for order placed
    setToastMessage('Your order was successfully placed!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Trigger global event for Navbar notifications
    const event = new CustomEvent('orderPlaced', { detail: { order_id, status: 'Pending' } });
    window.dispatchEvent(event);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="min-h-screen bg-white font-['DM_Sans']">
      {/* NAVBAR */}
      <Navbar cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Dashboard onAddToCart={addToCart} />} />
        <Route path="/menu" element={<Menu onAddToCart={addToCart} />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>

      {/* CART MODAL */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
        totalAmount={totalAmount}
        onCheckout={() => {
          setIsCartOpen(false);
          setTimeout(() => setIsCheckoutOpen(true), 200);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-[999999]"
          >
            <div className="bg-white border border-green-500 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckCircle size={14} />
              </div>
              <div>
                <p className="text-[12px] text-black">{toastMessage}</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 mt-1">
                  {toastMessage === 'Added to cart' ? 'Item successfully added' : 'Order will appear in notifications'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}