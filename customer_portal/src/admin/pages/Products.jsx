import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { CUSTOMER_BASE, BASE } from "../../services/config";

export default function Products() {

  const [products, setProducts] =
    useState([]);

  const [activeCat, setActiveCat] =
    useState("All");

  const [selectedOptions, setSelectedOptions] =
    useState({});

    const [drinks, setDrinks] =
  useState([]);

const [addons, setAddons] =
  useState([]);

  // EDIT MODAL
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [editName, setEditName] =
    useState("");

  const [editCategory, setEditCategory] =
    useState("");

  // PRICES
  const [regularPrice, setRegularPrice] =
    useState("");

  const [mealPrice, setMealPrice] =
    useState("");

  const [comboPrice, setComboPrice] =
    useState("");

  const [slicePrice, setSlicePrice] =
    useState("");

  const [smallPrice, setSmallPrice] =
    useState("");

  const [bigPrice, setBigPrice] =
    useState("");

  // AVAILABILITY
  const [regularAvailable, setRegularAvailable] =
    useState("1");

  const [mealAvailable, setMealAvailable] =
    useState("1");

  const [comboAvailable, setComboAvailable] =
    useState("1");

  const [sliceAvailable, setSliceAvailable] =
    useState("1");

  const [smallAvailable, setSmallAvailable] =
    useState("1");

  const [bigAvailable, setBigAvailable] =
    useState("1");

// FETCH PRODUCTS
useEffect(() => {

  // DRINKS
  fetch(
    `${CUSTOMER_BASE}/api_products.php?action=drinks`
  )
    .then((res) => res.json())
    .then((data) => {
      setDrinks(data);
    });

  // ADDONS
  fetch(
    `${CUSTOMER_BASE}/api_products.php?action=addons`
  )
    .then((res) => res.json())
    .then((data) => {
      setAddons(data);
    });

  // PRODUCTS
  fetch(
    `${CUSTOMER_BASE}/api_products.php?action=list`
  )
    .then((res) => res.json())
    .then((data) => {

      if (Array.isArray(data)) {

        // REMOVE DRINKS + ADDONS
        const filtered =
          data.filter(
            (p) =>
              p.name.toLowerCase() !==
                "cake customization" &&
              p.category?.toUpperCase() !==
                "DRINKS" &&
              p.category?.toUpperCase() !==
                "ADDONS"
          );

        setProducts(filtered);

        const defaults = {};

        filtered.forEach((p) => {
          const option = getDefaultOption(p);
          defaults[p.id] = option;
        });

        setSelectedOptions(
          defaults
        );

      }

    });

}, []);

  // CATEGORIES
  const categories = [
    "All",
    "Cakes",
    "Meals",
    "Pasta",
    "Starter"
  ];

  // FILTER
  const filtered = products.filter(
    (p) =>
      activeCat === "All" ||
      p.category?.toLowerCase() ===
        activeCat.toLowerCase()
  );

  // CHANGE OPTION
  const changeOption = (
    productId,
    option
  ) => {

    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: option,
    }));

  };

 // GET OPTIONS
const getOptions = (product) => {

  const category =
    product.category?.toUpperCase();

  // CAKES
  if (category === "CAKES") {

    return [
      "SLICE",
      "SMALL",
      "BIG"
    ];

  }

  // MEALS
  if (category === "MEALS") {

    return [
      "REGULAR",
      "MEAL",
      "COMBO"
    ];

  }

  // PASTA
  if (category === "PASTA") {

    return [
      "REGULAR",
      "MEAL"
    ];

  }

  // STARTER
  if (category === "STARTER") {

    return [
      "SOLO",
      "SHARING"
    ];

  }

  return [];

};

const getOptionPrice = (product, option) => {
  const category = product.category?.toUpperCase();

  if (category === "CAKES") {
    if (option === "SLICE") return parseFloat(product.slice_price) || 0;
    if (option === "SMALL") return parseFloat(product.small_price) || 0;
    if (option === "BIG") return parseFloat(product.big_price) || 0;
  }

  if (category === "MEALS" || category === "PASTA") {
    if (option === "REGULAR") return parseFloat(product.price) || 0;
    if (option === "MEAL") return parseFloat(product.meal_price) || 0;
    if (option === "COMBO") return parseFloat(product.combo_price) || 0;
  }

  if (category === "STARTER") {
    if (option === "SOLO") return parseFloat(product.solo_price) || 0;
    if (option === "SHARING") return parseFloat(product.sharing_price) || 0;
  }

  return parseFloat(product.price) || 0;
};

const getDefaultOption = (product) => {
  const options = getOptions(product);
  return (
    options.find((option) => getOptionPrice(product, option) > 0) ||
    options[0] ||
    "REGULAR"
  );
};

  // GET PRICE
  const getDisplayPrice = (
    product
  ) => {
    const current =
      selectedOptions[product.id] ||
      getDefaultOption(product);

    return getOptionPrice(product, current);
  };

  // CHECK AVAILABILITY
  const isSizeUnavailable = (
    product,
    option
  ) => {
    return getOptionPrice(product, option) <= 0;
  };

  // OPEN EDIT
  const openEdit = (product) => {

    setEditingProduct(product);

    setEditName(product.name);

    setEditCategory(
      product.category
    );

    // CAKES
    setSlicePrice(
      product.slice_price || ""
    );

    setSmallPrice(
      product.small_price || ""
    );

    setBigPrice(
      product.big_price || ""
    );

    // STARTER
if (
  product.category?.toUpperCase() === "STARTER"
) {

  setRegularPrice(
    product.solo_price || ""
  );

  setComboPrice(
    product.sharing_price || ""
  );

} else {

  // OTHER
  setRegularPrice(
    product.price || ""
  );

  setMealPrice(
    product.meal_price || ""
  );

  setComboPrice(
    product.combo_price || ""
  );

}

    // AVAILABILITY
    setSliceAvailable(
      product.slice_available || "1"
    );

    setSmallAvailable(
      product.small_available || "1"
    );

    setBigAvailable(
      product.big_available || "1"
    );

    setRegularAvailable(
      product.regular_available || "1"
    );

    setMealAvailable(
      product.meal_available || "1"
    );

    setComboAvailable(
      product.combo_available || "1"
    );

  };

  // SAVE
  const handleSave = async () => {

    try {

        const response = await fetch(
          `${CUSTOMER_BASE}/api_products.php?action=edit`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            id:
              editingProduct.id,

            name:
              editName,

            category:
              editCategory,

            // CAKES
            slice_price: slicePrice,
            small_price: smallPrice,
            big_price: bigPrice,

            // STARTER
            solo_price:
              editCategory?.toUpperCase() === "STARTER"
                ? regularPrice
                : null,

            sharing_price:
              editCategory?.toUpperCase() === "STARTER"
                ? comboPrice
                : null,

            // MEALS / PASTA
            price:
              editCategory?.toUpperCase() === "CAKES" ||
              editCategory?.toUpperCase() === "STARTER"
                ? 0
                : regularPrice,

            meal_price:
              editCategory?.toUpperCase() === "MEALS" ||
              editCategory?.toUpperCase() === "PASTA"
                ? mealPrice
                : 0,

            combo_price:
              editCategory?.toUpperCase() === "MEALS" ||
              editCategory?.toUpperCase() === "PASTA"
                ? comboPrice
                : 0,

          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {

        window.location.reload();

      } else {

        alert("Update failed");

      }

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="bg-[#f7f7f7] min-h-screen font-['DM_Sans']">

      <AdminNavbar />

      <main className="px-6 md:px-10 py-14">

        <div className="max-w-[1400px] mx-auto">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">

            <div>

              <p className="text-[#d4af37] text-[10px] font-black tracking-[0.3em] uppercase mb-2">
                Admin Product Management
              </p>

              <h2 className="text-5xl md:text-6xl tracking-tight font-black text-gray-900">
                Products
              </h2>

            </div>

            {/* CATEGORIES */}
            <div className="flex bg-white p-1.5 rounded-full border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">

              {categories.map((cat) => (

                <button
                  key={cat}
                  onClick={() =>
                    setActiveCat(cat)
                  }
                  className={`px-7 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] whitespace-nowrap transition-all font-black ${
                    activeCat === cat
                      ? "bg-black text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >

                  {cat}

                </button>

              ))}

            </div>

          </div>

          {/* PRODUCTS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">

            {filtered.map((product) => {

              const options =
                getOptions(product);

              const currentOption =
                selectedOptions[
                  product.id
                ];

              return (

                <div
                  key={product.id}
                  className="group bg-white rounded-[35px] p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center border border-gray-100"
                >

                  {/* IMAGE */}
                  <div className="w-24 h-24 md:w-28 md:h-28 mb-4 overflow-hidden rounded-full bg-white shadow-inner flex-shrink-0 border border-gray-50">

                    <img
                      src={`${BASE}/uploads/${product.image}`}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                  </div>

                  {/* NAME */}
                  <h3 className="text-[12px] font-bold text-gray-800 leading-tight mb-2 px-1 line-clamp-2 min-h-[32px]">
                    {product.name}
                  </h3>

                  {/* OPTIONS */}
                  {options.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">

                      {options.map((opt) => {

                        const unavailable =
                          isSizeUnavailable(
                            product,
                            opt
                          );

                        return (

                          <div
                            key={opt}
                            className="relative"
                          >

                            {unavailable && (

                              <div className="absolute -top-2 -right-3 rotate-12 bg-red-500 text-white text-[7px] px-2 py-[2px] rounded-full font-black z-20">
                                OFF
                              </div>

                            )}

                            <button
                              type="button"
                              onClick={() =>
                                !unavailable &&
                                changeOption(
                                  product.id,
                                  opt
                                )
                              }
                              disabled={unavailable}
                              className={`px-3 py-2 rounded-xl text-[8px] font-black border transition-all ${
                                currentOption === opt
                                  ? "bg-black text-white"
                                  : "bg-white text-gray-400"
                              } ${
                                unavailable
                                  ? "opacity-50 pointer-events-none"
                                  : ""
                              }`}
                            >

                              {opt}

                            </button>

                          </div>

                        );

                      })}

                    </div>
                  )}

                  {/* PRICE */}
                  <p className="text-[20px] font-black text-black mb-4">
                    ₱{getDisplayPrice(product)}
                  </p>

                  {/* BUTTON */}
                  <button
                    onClick={() =>
                      openEdit(product)
                    }
                    className="w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] bg-black text-white hover:bg-[#d4af37] hover:text-black transition-all"
                  >

                    Edit Product

                  </button>

                </div>

              );

            })}

          </div>

        </div>

      </main>

      {/* MODAL */}
      {editingProduct && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5 py-10">

          <div className="bg-white rounded-[35px] w-full max-w-lg p-10 overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-100">

            <h1 className="text-4xl font-black mb-8 text-gray-900">
              Edit Product
            </h1>

            {/* NAME */}
            <input
              type="text"
              value={editName}
              onChange={(e) =>
                setEditName(
                  e.target.value
                )
              }
              placeholder="Product Name"
              className="w-full border p-4 rounded-2xl mb-4"
            />

            {/* CATEGORY */}
            <input
              type="text"
              value={editCategory}
              onChange={(e) =>
                setEditCategory(
                  e.target.value
                )
              }
              placeholder="Category"
              className="w-full border p-4 rounded-2xl mb-6"
            />

            {/* CAKES */}
{editCategory?.toUpperCase() === "CAKES" && (
  <>
    <input
      type="number"
      value={slicePrice}
      onChange={(e) =>
        setSlicePrice(
          e.target.value
        )
      }
      placeholder="Slice Price"
      className="w-full border p-4 rounded-2xl mb-4"
    />

    <input
      type="number"
      value={smallPrice}
      onChange={(e) =>
        setSmallPrice(
          e.target.value
        )
      }
      placeholder="Small Price"
      className="w-full border p-4 rounded-2xl mb-4"
    />

    <input
      type="number"
      value={bigPrice}
      onChange={(e) =>
        setBigPrice(
          e.target.value
        )
      }
      placeholder="Big Price"
      className="w-full border p-4 rounded-2xl mb-8"
    />
  </>
)}

{/* MEALS + PASTA + STARTER */}
{editCategory?.toUpperCase() !== "CAKES" && (
  <>
    <input
      type="number"
      value={regularPrice}
      onChange={(e) =>
        setRegularPrice(
          e.target.value
        )
      }
      placeholder="Regular / Solo Price"
      className="w-full border p-4 rounded-2xl mb-4"
    />

    <input
      type="number"
      value={mealPrice}
      onChange={(e) =>
        setMealPrice(
          e.target.value
        )
      }
      placeholder="Meal Price"
      className="w-full border p-4 rounded-2xl mb-4"
    />

    <input
      type="number"
      value={comboPrice}
      onChange={(e) =>
        setComboPrice(
          e.target.value
        )
      }
      placeholder="Combo / Sharing Price"
      className="w-full border p-4 rounded-2xl mb-8"
    />
  </>
)}

{/* AVAILABILITY */}

<div className="space-y-4 mb-8">

  <h3 className="text-sm font-black uppercase tracking-[0.2em]">
    Availability
  </h3>

  {/* CAKES */}
  {editCategory?.toUpperCase() === "CAKES" && (
    <>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
          Slice Available
        </span>

        <select
          value={sliceAvailable}
          onChange={(e) =>
            setSliceAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
          Small Available
        </span>

        <select
          value={smallAvailable}
          onChange={(e) =>
            setSmallAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
          Big Available
        </span>

        <select
          value={bigAvailable}
          onChange={(e) =>
            setBigAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

    </>
  )}

  {/* MEALS / PASTA / STARTER */}
  {editCategory?.toUpperCase() !== "CAKES" && (
    <>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
  {editCategory?.toUpperCase() === "STARTER"
    ? "Solo Available"
    : "Regular Available"}
</span>

        <select
          value={regularAvailable}
          onChange={(e) =>
            setRegularAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
          Meal Available
        </span>

        <select
          value={mealAvailable}
          onChange={(e) =>
            setMealAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

      <div className="flex items-center justify-between border rounded-2xl p-4">

        <span className="font-bold">
  {editCategory?.toUpperCase() === "STARTER"
    ? "Sharing Available"
    : "Combo / Sharing Available"}
</span>

        <select
          value={comboAvailable}
          onChange={(e) =>
            setComboAvailable(
              e.target.value
            )
          }
          className="border rounded-xl px-3 py-2"
        >
          <option value="1">
            ON
          </option>

          <option value="0">
            OFF
          </option>
        </select>

      </div>

    </>
  )}

</div>

{/* DRINKS AVAILABILITY */}
{editCategory?.toUpperCase() !== "CAKES" &&
 editCategory?.toUpperCase() !== "STARTER" && (

  <div className="mb-8">

    <h2 className="text-lg font-black mb-4">
      Drinks Availability
    </h2>

    <div className="space-y-3">

      {drinks.map((drink) => (

        <div
          key={drink.id}
          className="flex items-center justify-between border rounded-2xl p-4"
        >

          <span className="font-bold">
            {drink.name}
          </span>

          <select
            value={drink.available}
            onChange={async (e) => {

              const updated =
                e.target.value;

              await fetch(
                `${CUSTOMER_BASE}/update_drink.php`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: drink.id,
                    available: updated
                  })
                }
              );

              setDrinks((prev) =>
                prev.map((d) =>
                  d.id === drink.id
                    ? {
                        ...d,
                        available: updated
                      }
                    : d
                )
              );

            }}
            className="border rounded-xl px-4 py-2"
          >

            <option value="1">
              Available
            </option>

            <option value="0">
              Unavailable
            </option>

          </select>

        </div>

      ))}

    </div>

  </div>

)}

{/* ADDONS AVAILABILITY */}
{editCategory?.toUpperCase() !== "CAKES" &&
 editCategory?.toUpperCase() !== "STARTER" && (

  <div className="mb-8">

    <h2 className="text-lg font-black mb-4">
      Add-ons Availability
    </h2>

    <div className="space-y-3">

      {addons
        .filter((addon) => {

          const category =
            editCategory?.toUpperCase();

          const addonName =
            addon.name.toLowerCase();

          // MEALS
          if (category === "MEALS") {

            return (
              addonName.includes("rice") ||
              addonName.includes("sauce")
            );

          }

          // PASTA
          if (category === "PASTA") {

            return (
              addonName.includes("garlic")
            );

          }

          return false;

        })
        .map((addon) => (

          <div
            key={addon.id}
            className="flex items-center justify-between border rounded-2xl p-4"
          >

            <span className="font-bold">
              {addon.name}
            </span>

            <select
              value={addon.available}
              onChange={async (e) => {

                const updated =
                  e.target.value;

                await fetch(
                  `${CUSTOMER_BASE}/update_addon.php`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: addon.id,
                      available: updated
                    })
                  }
                );

                setAddons((prev) =>
                  prev.map((a) =>
                    a.id === addon.id
                      ? {
                          ...a,
                          available: updated
                        }
                      : a
                  )
                );

              }}
              className="border rounded-xl px-4 py-2"
            >

              <option value="1">
                Available
              </option>

              <option value="0">
                Unavailable
              </option>

            </select>

          </div>

      ))}

    </div>

  </div>

)}

            {/* BUTTONS */}
            <div className="flex gap-4">

              <button
                onClick={() =>
                  setEditingProduct(
                    null
                  )
                }
                className="flex-1 bg-gray-100 py-4 rounded-full font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}