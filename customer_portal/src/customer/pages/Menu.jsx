import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function Menu({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState('All');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

 useEffect(() => {
  fetch('http://localhost/pastry_system/customer/api_products.php?action=list')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        // Filter out items with name "Cake Customization"
        const filtered = data.filter(p => p.name.toLowerCase() !== 'cake customization');
        setProducts(filtered);
      }
    });
}, []);

  const handleAction = (
    product,
    size,
    price
  ) => {
    const cat =
      product.category?.toUpperCase();

    if (
      cat === 'CAKES' ||
      cat === 'STARTER'
    ) {
      onAddToCart({
        ...product,
        variant: size,
        qty: 1,
        price: price
      });
    } else {
      setSelectedProduct({
        ...product,
        variant: size,
        basePrice: price
      });

      setIsModalOpen(true);
    }
  };

  const filtered = products.filter(
    (p) =>
      activeCat === 'All' ||
      p.category?.toLowerCase() ===
        activeCat.toLowerCase()
  );

  const categories = [
    'All',
    'Cakes',
    'Meals',
    'Pasta',
    'Starter'
  ];

  return (
    <main className="bg-white min-h-screen px-6 md:px-10 py-10 font-['DM_Sans']">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">

          {/* LEFT SIDE TITLE */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#d4af37] font-black mb-3">
              Pastry Project Menu
            </p>

            <h2 className="text-5xl md:text-6xl tracking-tight font-bold font-['Playfair_Display'] leading-none">
              {activeCat === 'All'
                ? 'Menu'
                : activeCat}
            </h2>
          </div>

          {/* CATEGORY BUTTONS */}
          <div className="flex items-center gap-5 flex-wrap">

            <div className="flex bg-gray-50 p-1.5 rounded-full border border-gray-100 shadow-inner overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCat(cat)
                  }
                  className={`px-7 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] whitespace-nowrap transition-all ${
                    activeCat === cat
                      ? 'bg-black text-white shadow-lg font-bold'
                      : 'text-gray-400 hover:text-black font-medium'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        product={selectedProduct}
        allCakes={products.filter(
          (p) =>
            p.category?.toLowerCase() ===
            'cakes'
        )}
        onAddToCart={onAddToCart}
      />
    </main>
  );
}