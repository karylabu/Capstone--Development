import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ isOpen, onClose, product, allCakes, onAddToCart }) {
  const [selectedDrink, setSelectedDrink] = useState('Iced Tea');
  const [selectedCake, setSelectedCake] = useState('');
  const [addOns, setAddOns] = useState([]);

  const category = (product?.category || '').trim().toLowerCase();
  const variant = (product?.variant || product?.defaultSize || '').trim().toLowerCase();

  const showDrinks = variant.includes('meal') || variant.includes('combo');
  const showCake = category.includes('meal') && variant.includes('combo');

  const availableCakes = useMemo(() =>
    allCakes.filter((p) => {
      const name = p.name.toLowerCase();
      return (
        !name.includes('customization') &&
        !name.includes('choco pistachio dream') &&
        !name.includes('blueberry cheesecake')
      );
    }), [allCakes]
  );

  useEffect(() => {
    if (availableCakes.length > 0) setSelectedCake(availableCakes[0].name);
    setSelectedDrink('Iced Tea');
    setAddOns([]);
  }, [isOpen, product, availableCakes]);

  if (!isOpen || !product) return null;

  const toggleAddOn = (name, price) => {
    setAddOns((prev) =>
      prev.find((a) => a.name === name)
        ? prev.filter((a) => a.name !== name)
        : [...prev, { name, price }]
    );
  };

  const handleConfirm = () => {
    const extraCost = addOns.reduce((sum, addon) => sum + addon.price, 0);
    onAddToCart({
      ...product,
      variant: product.variant || product.defaultSize,
      qty: 1,
      price: (product.basePrice || 0) + extraCost,
      selectionDetails: {
        drink: showDrinks ? selectedDrink : null,
        cake: showCake ? selectedCake : null,
        extras: addOns
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[30000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 pt-[110px] pb-6 font-['DM_Sans']">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-[420px] rounded-[36px] shadow-2xl relative flex flex-col max-h-[calc(100vh-130px)]"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all z-[100]"
        >
          <X size={14} className="text-gray-400" />
        </button>

        {/* 1. Header Section (Title & Badge) */}
        <div className="p-8 pb-4 flex-shrink-0">
          <h2 className="text-[24px] font-bold text-gray-900 tracking-tight mb-2">
            {product.name}
          </h2>
          <div className="inline-flex px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest border border-gray-100">
            {variant}
          </div>
        </div>

        {/* 2. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-2 space-y-7 no-scrollbar">
          
          {/* Drink Selection */}
          {showDrinks && (
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                Select Drink
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Iced Tea', 'Cucumber', 'Lychee', 'Blue Lemonade'].map((drink) => (
                  <button
                    key={drink}
                    onClick={() => setSelectedDrink(drink)}
                    className={`h-[46px] rounded-xl border transition-all text-[11px] font-bold ${
                      selectedDrink === drink
                        ? 'bg-black border-black text-white shadow-lg shadow-black/10'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {drink}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cake Selection */}
          {showCake && (
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                Free Cake Slice
              </label>
              <select
                value={selectedCake}
                onChange={(e) => setSelectedCake(e.target.value)}
                className="w-full h-[50px] px-5 rounded-xl bg-gray-50 border-none outline-none text-[12px] font-bold appearance-none cursor-pointer"
              >
                {availableCakes.map((cake) => (
                  <option key={cake.id} value={cake.name}>{cake.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Add-ons Section */}
          <div className="space-y-3 pb-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
              Extra Add-ons
            </label>
            <div className="space-y-2">
              {category.includes('pasta') && (
                <button
                  onClick={() => toggleAddOn('Garlic Bread', 15)}
                  className={`w-full h-[54px] rounded-2xl border px-5 flex items-center justify-between transition-all ${
                    addOns.find((a) => a.name === 'Garlic Bread')
                      ? 'border-black bg-gray-50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <span className="text-[12px] font-bold text-gray-700">Garlic Bread</span>
                  <span className="text-[11px] font-black text-[#d4af37]">₱15</span>
                </button>
              )}

              {category.includes('meal') &&
                [{ name: 'Extra Rice', price: 35 }, { name: 'Extra Sauce', price: 10 }].map((addon) => {
                  const isSelected = addOns.find((a) => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      onClick={() => toggleAddOn(addon.name, addon.price)}
                      className={`w-full h-[54px] rounded-2xl border px-5 flex items-center justify-between transition-all ${
                        isSelected ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <span className="text-[12px] font-bold text-gray-700">{addon.name}</span>
                      <span className="text-[11px] font-black text-[#d4af37]">₱{addon.price}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* 3. Footer Section (Fixed Bottom) */}
        <div className="p-8 pt-4 flex-shrink-0 bg-white rounded-b-[40px]">
          <button
            onClick={handleConfirm}
            className="w-full h-[56px] rounded-[24px] bg-black text-white hover:bg-black/90 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.97] shadow-xl shadow-black/10"
          >
            <ShoppingBag size={16} />
            Confirm & Add
          </button>
        </div>
      </motion.div>
    </div>
  );
}