import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";

export default function CartModal({ isOpen, onClose, items = [], setItems, onCheckout }) {
  // Group identical items
  const groupedItems = useMemo(() => {
    const grouped = {};
    items.forEach(item => {
      const key = JSON.stringify({
        name: item.name,
        variant: item.variant,
        selectionDetails: item.selectionDetails
      });
      if (!grouped[key]) grouped[key] = { ...item, qty: 1 };
      else grouped[key].qty += 1;
    });
    return Object.values(grouped);
  }, [items]);

  const total = groupedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleRemove = (key) => {
    setItems(items.filter(i =>
      JSON.stringify({
        name: i.name,
        variant: i.variant,
        selectionDetails: i.selectionDetails
      }) !== key
    ));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[100px]"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[1000px] h-[600px] bg-white rounded-[40px] flex overflow-hidden shadow-xl font-sans"
        >
          {/* Left Basket */}
          <div className="flex-[1.2] p-8 overflow-y-auto custom-scrollbar font-sans">
            <h2 className="text-3xl text-gray-900 mb-6">Your Basket</h2>
            <div className="space-y-4">
              {groupedItems.map(item => {
                const key = JSON.stringify({
                  name: item.name,
                  variant: item.variant,
                  selectionDetails: item.selectionDetails
                });
                return (
                  <div key={key} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={`http://localhost/pastry_system/uploads/${item?.image || ''}`}
                        alt={item?.name}
                        className="w-full h-full object-contain"
                        onError={e => { e.target.src = 'https://via.placeholder.com/150?text=Item'; }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">₱{item.price}</span>
                          <button onClick={() => handleRemove(key)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.selectionDetails?.drink && (
                          <span className="px-2 py-0.5 bg-blue-50 text-[9px] text-blue-500 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            {item.selectionDetails.drink}
                          </span>
                        )}
                        {item.selectionDetails?.cake && (
                          <span className="px-2 py-0.5 bg-yellow-50 text-[9px] text-yellow-600 rounded-full flex items-center gap-1">
                            {item.selectionDetails.cake}
                          </span>
                        )}
                        {item.selectionDetails?.extras?.map((extra,i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-50 text-[9px] text-green-600 rounded-full flex items-center gap-1">
                            {extra.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-[2px] bg-gray-100 my-12" />

          {/* Right Summary */}
          <div className="flex-1 bg-white p-10 flex flex-col relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-8 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <p className="text-[11px] font-bold tracking-[0.2em] text-gray-300 uppercase mb-8">Summary</p>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {groupedItems.map(item => {
                const key = JSON.stringify({
                  name: item.name,
                  variant: item.variant,
                  selectionDetails: item.selectionDetails
                });
                return (
                  <div key={key} className="flex items-center gap-3">
                    <img
                      src={`http://localhost/pastry_system/uploads/${item?.image || ''}`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      alt=""
                      onError={e => { e.target.src = 'https://via.placeholder.com/50?text=Item'; }}
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-gray-700 leading-tight">{item.name}</p>
                      <p className="text-[11px] text-gray-400">x{item.qty}</p>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-600">₱{item.price * item.qty}</span>
                  </div>
                );
              })}
            </div>

            {/* Total Section */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <span className="text-xl font-bold text-yellow-500/80 uppercase tracking-widest">Total</span>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tighter flex items-baseline justify-end">
                    <span className="text-2xl mr-1 italic">₱</span>
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-5 bg-black text-white rounded-full font-bold text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
              >
                Checkout
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}