import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart({
  isOpen,
  onClose,
  cartItems = [],
  setCartItems,
  totalAmount = 0,
  setIsCheckout
}) {

  // Ensure cart is always an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const safeTotalAmount = Number(totalAmount) || 0;

  const deliveryFee = safeCartItems.length > 0 ? 45 : 0;
  const grandTotal = safeTotalAmount + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] h-screen bg-white shadow-2xl flex flex-col relative font-['DM_Sans']"
          >

            {/* HEADER */}
            <div className="px-10 pt-12 pb-8 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-gray-900">Cart</h2>
                <p className="text-[10px] uppercase tracking-[0.35em] font-black text-gray-400 mt-2">
                  {safeCartItems.length} {safeCartItems.length === 1 ? 'ITEM' : 'ITEMS'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-5 no-scrollbar">
              {safeCartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <ShoppingBag size={60} strokeWidth={1} />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black">Your cart is empty</p>
                </div>
              ) : (
                safeCartItems.map((item, index) => {
                  const itemPrice = Number(item?.price) || 0;

                  return (
                    <div
                      key={item.id || index}
                      className="border border-gray-100 rounded-[35px] p-6 flex items-center justify-between bg-white"
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={`http://localhost/pastry_system/uploads/${item?.image || ''}`}
                            alt={item?.name || 'Product'}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Item'; }}
                          />
                        </div>

                        <div className="text-left">
                          <h3 className="text-[15px] font-bold leading-tight text-gray-800">
                            {item?.name || 'Product'}
                          </h3>

                          <p className="text-[9px] uppercase tracking-[0.25em] font-black text-gray-400 mt-1">
                            {item?.variant || 'Standard'}
                          </p>

                          {/* CUSTOM DETAILS */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item?.selectionDetails?.drink && (
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-[8px] font-black uppercase text-blue-500">
                                {item.selectionDetails.drink}
                              </span>
                            )}

                            {item?.selectionDetails?.cake && (
                              <span className="px-3 py-1 rounded-full bg-yellow-50 text-[8px] font-black uppercase text-[#d4af37]">
                                {item.selectionDetails.cake}
                              </span>
                            )}

                            {item?.selectionDetails?.extras?.map((extra, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-green-50 text-[8px] font-black uppercase text-green-600"
                              >
                                {extra.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex flex-col items-end gap-5">
                        <p className="text-2xl font-black tracking-tight text-gray-900">
                          ₱{itemPrice.toLocaleString()}
                        </p>

                        <button
                          onClick={() =>
                            setCartItems(
                              safeCartItems.filter((_, i) => i !== index)
                            )
                          }
                          className="text-gray-300 hover:text-red-500 transition-all p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-10 py-10 bg-white flex-shrink-0">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-[14px] font-black text-gray-600">
                    ₱{safeTotalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Delivery Fee</span>
                  <span className="text-[14px] font-black text-gray-600">
                    ₱{deliveryFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="flex items-end justify-between mb-10">
                <h2 className="text-4xl font-serif font-bold text-[#d4af37] italic">Total</h2>
                <p className="text-5xl font-black tracking-tighter text-gray-900 leading-none">
                  ₱{grandTotal.toLocaleString()}
                </p>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={() => {
                  onClose();
                  if (setIsCheckout) setIsCheckout(true);
                }}
                disabled={safeCartItems.length === 0}
                className="w-full bg-black text-white py-6 rounded-[30px] text-[11px] font-black uppercase tracking-[0.35em] hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-20 shadow-xl shadow-black/10 active:scale-[0.98]"
              >
                Checkout Order
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}