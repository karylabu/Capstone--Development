import React, { useState } from 'react';

export default function ProductCard({
  product,
  onAction
}) {
  const [selectedOption, setSelectedOption] =
    useState('');

  if (!product) return null;

  const category = product.category
    ? product.category.toUpperCase()
    : '';

  const options =
    category === 'CAKES'
      ? ['SLICE', 'SMALL', 'BIG']
      : category === 'STARTER'
      ? ['SOLO', 'SHARING']
      : category === 'MEALS'
      ? ['REGULAR', 'MEAL', 'COMBO']
      : ['REGULAR', 'MEAL'];

  const currentOption =
    selectedOption || options[0];

  const getDisplayPrice = () => {
    if (category === 'CAKES') {
      if (currentOption === 'SLICE') {
        return (
          parseFloat(product.slice_price) || 0
        );
      }

      if (currentOption === 'SMALL') {
        return (
          parseFloat(product.small_price) || 0
        );
      }

      if (currentOption === 'BIG') {
        return (
          parseFloat(product.big_price) || 0
        );
      }
    }

    if (category === 'PASTA') {
      return currentOption === 'REGULAR'
        ? 140
        : 165;
    }

    if (category === 'MEALS') {
      return currentOption === 'REGULAR'
        ? 199
        : currentOption === 'MEAL'
        ? 219
        : 309;
    }

    return parseFloat(product.price) || 0;
  };

 const isDirectAdd = true;

  return (
    <div className="group bg-[#f9f9f9] rounded-[35px] p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center border border-transparent hover:border-gray-100">
      
      <div className="w-24 h-24 md:w-28 md:h-28 mb-4 overflow-hidden rounded-full bg-white shadow-inner flex-shrink-0 border border-gray-50">
        <img
          src={
            product.image
              ? `http://localhost/pastry_system/uploads/${product.image}`
              : 'https://via.placeholder.com/150'
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col flex-grow w-full">
        <h3 className="text-[12px] font-bold text-gray-800 leading-tight mb-2 px-1 line-clamp-2 min-h-[32px]">
          {product.name}
        </h3>

        <div className="flex bg-white p-1 rounded-xl mb-3 border border-gray-100 self-center">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOption(opt);
              }}
              className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${
                currentOption === opt
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-300 hover:text-black'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="text-[13px] font-black text-black mb-4">
          ₱{getDisplayPrice().toLocaleString()}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();

            onAction(
              {
                ...product,
                variant: currentOption
              },
              currentOption,
              getDisplayPrice()
            );
          }}
          className="w-full py-2 bg-black text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all"
        >
          
          Add to Cart
         
        </button>
      </div>
    </div>
  );
}