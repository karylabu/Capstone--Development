import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CustomCakeModal from '../components/CustomCakeModal'; // ✅ import your custom modal

function Banner({ onOrderClick }) {
  return (
    <div className="relative w-full h-[500px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden font-['DM_Sans']">
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2000')",
        }}
      />
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-4"
        >
          Pastry Project by Chef Lawrence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white text-6xl md:text-7xl font-serif mb-8 leading-tight font-bold"
        >
          Baked Fresh,
          <br />
          <span className="italic text-[#d4af37]">
            Made with Love.
          </span>
        </motion.h1>
        <motion.button
          onClick={onOrderClick}
          whileHover={{ scale: 1.05 }}
          className="bg-[#d4af37] text-black px-12 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl"
        >
          Browse Menu
        </motion.button>
      </div>
    </div>
  );
}

export default function Dashboard({ onAddToCart, navigate }) {
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false); // ✅ separate state for custom cake modal

  useEffect(() => {
    fetch(
      'http://localhost/pastry_system/customer/api_products.php?action=list'
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      });
  }, []);

  const handleAction = (product, size, price) => {
    const cat = product.category?.toUpperCase();
    if (cat === 'CAKES' || cat === 'STARTER') {
      onAddToCart({ ...product, variant: size, qty: 1, price });
    } else {
      setSelectedProduct({ ...product, variant: size, basePrice: price });
      setIsProductModalOpen(true); // ✅ opens only regular product modal
    }
  };

  const bestSellers = useMemo(
    () =>
      products
        .filter((p) => !p.name.toLowerCase().includes('customization'))
        .slice(0, 6),
    [products]
  );

  const mustTry = useMemo(
    () =>
      products
        .filter((p) => !p.name.toLowerCase().includes('customization'))
        .slice(6, 12),
    [products]
  );

  return (
    <div className="bg-white min-h-screen font-['DM_Sans']">
      {/* Banner */}
      <Banner onOrderClick={() => navigate('/menu')} />

      <div className="max-w-7xl mx-auto px-10 py-12">

        {/* CUSTOM CAKE SECTION */}
        <div className="relative w-full h-[350px] rounded-[50px] overflow-hidden group bg-black shadow-2xl mb-20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-1000"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=2000')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center px-16 text-left">
            <div className="max-w-md">
              <h2 className="text-white text-5xl font-serif font-bold mb-4 leading-tight">
                Want to customize
                <br />
                <span className="text-[#d4af37]">your cake?</span>
              </h2>
              <p className="text-gray-300 text-sm mb-8 leading-relaxed font-medium">
                Choose your flavors, tiers, dedication, and inspiration photos.
                We'll bake it exactly how you want it.
              </p>
              <button
                onClick={() => setIsCustomCakeOpen(true)}
                className="bg-white text-black px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#d4af37] transition-all shadow-xl"
              >
                Customize Now
              </button>
            </div>
          </div>
        </div>

        {/* BEST SELLERS */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-3">Customer Favorites</p>
              <h2 className="text-4xl font-serif font-bold tracking-tight">Best Sellers</h2>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all"
            >
              View Menu
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} onAction={handleAction} />
            ))}
          </div>
        </section>

        {/* MUST TRY */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-3">Chef Recommendation</p>
              <h2 className="text-4xl font-serif font-bold tracking-tight">Must Try</h2>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all"
            >
              Explore More
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {mustTry.map((p) => (
              <ProductCard key={p.id} product={p} onAction={handleAction} />
            ))}
          </div>
        </section>
      </div>

      {/* REGULAR PRODUCT MODAL */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        allCakes={products.filter((p) => p.category === 'Cakes')}
        onAddToCart={onAddToCart}
      />

      {/* CUSTOM CAKE MODAL */}
      <CustomCakeModal
        isOpen={isCustomCakeOpen}
        onClose={() => setIsCustomCakeOpen(false)}
        allCakes={products.filter((p) => p.category === 'Cakes')}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}