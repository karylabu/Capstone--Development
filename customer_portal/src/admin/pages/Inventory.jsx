import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import { STAFF_BASE } from "../../services/config";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientCategory, setIngredientCategory] = useState("");
  const [ingredientSKU, setIngredientSKU] = useState("");
  const [ingredientOnHand, setIngredientOnHand] = useState("");
  const [ingredientMinStock, setIngredientMinStock] = useState("");
  const [ingredientReorderQty, setIngredientReorderQty] = useState("");
  const [ingredientExpiryDate, setIngredientExpiryDate] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("kg");

  // Fetch Ingredients
  useEffect(() => {
    // Hardcoded sample data - replace with API call when database is ready
    const sampleData = [
      {
        id: 1,
        name: "Unsalted Butter",
        sku: "SKU-001",
        category: "Dairy",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 2,
        name: "Flour",
        sku: "SKU-002",
        category: "Dairy",
        on_hand: 35,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 3,
        name: "Butter",
        sku: "SKU-003",
        category: "Dry Goods",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 4,
        name: "Dairy Cream",
        sku: "SKU-004",
        category: "Dry Goods",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 5,
        name: "All-Purpose Flour",
        sku: "SKU-005",
        category: "Dry Goods",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 6,
        name: "Popball Cream",
        sku: "SKU-006",
        category: "Dry Goods",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 7,
        name: "Unsalted Butter (Premium)",
        sku: "SKU-007",
        category: "Dairy",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 8,
        name: "Eggs",
        sku: "SKU-008",
        category: "Dry Goods",
        on_hand: 45,
        minimum_stock: 10,
        reorder_qty: 35,
        expiry_date: "2024-08-15",
        unit: "kg",
      },
      {
        id: 9,
        name: "Sugar",
        sku: "SKU-009",
        category: "Dry Goods",
        on_hand: 60,
        minimum_stock: 15,
        reorder_qty: 40,
        expiry_date: "2025-01-20",
        unit: "kg",
      },
      {
        id: 10,
        name: "Baking Powder",
        sku: "SKU-010",
        category: "Dry Goods",
        on_hand: 8,
        minimum_stock: 5,
        reorder_qty: 10,
        expiry_date: "2024-12-10",
        unit: "kg",
      },
    ];
    setInventory(sampleData);
    setLoading(false);

    // TODO: Replace with actual API call when database is ready
    // fetchIngredients();
  }, []);

  // Get Categories
  const categories = Array.from(
    new Set(inventory.map((item) => item.category || "Other"))
  ).filter((cat) => cat);

  // Filter Inventory
  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" ||
      (item.category || "Other") === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Analytics
  const stats = {
    totalItems: inventory.length,
    criticalLow: inventory.filter(
      (item) => Number(item.on_hand) <= Number(item.minimum_stock)
    ).length,
    expiringsoon: inventory.filter((item) => {
      if (!item.expiry_date) return false;
      const today = new Date();
      const expiry = new Date(item.expiry_date);
      const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
    totalValue: inventory.reduce(
      (sum, item) => sum + Number(item.on_hand || 0),
      0
    ),
  };

  // Open Edit Modal
  const openEdit = (item) => {
    setEditingItem(item);
    setIngredientName(item.name || "");
    setIngredientCategory(item.category || "");
    setIngredientSKU(item.sku || "");
    setIngredientOnHand(item.on_hand || "");
    setIngredientMinStock(item.minimum_stock || "");
    setIngredientReorderQty(item.reorder_qty || "");
    setIngredientExpiryDate(item.expiry_date || "");
    setIngredientUnit(item.unit || "kg");
  };

  // Save Ingredient
  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing ingredient
        setInventory((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  on_hand: ingredientOnHand,
                  minimum_stock: ingredientMinStock,
                  reorder_qty: ingredientReorderQty,
                  expiry_date: ingredientExpiryDate,
                  unit: ingredientUnit,
                }
              : item
          )
        );
      } else {
        // Add new ingredient
        const newIngredient = {
          id: Math.max(...inventory.map((i) => i.id), 0) + 1,
          name: ingredientName,
          category: ingredientCategory,
          sku: ingredientSKU,
          on_hand: ingredientOnHand,
          minimum_stock: ingredientMinStock,
          reorder_qty: ingredientReorderQty,
          expiry_date: ingredientExpiryDate,
          unit: ingredientUnit,
        };
        setInventory((prev) => [...prev, newIngredient]);
      }
      closeModals();
      // TODO: Send to API when database is ready
    } catch (error) {
      console.log(error);
      alert("Error saving ingredient");
    }
  };

  // Delete Ingredient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;

    try {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      // TODO: Send to API when database is ready
    } catch (error) {
      console.log(error);
      alert("Error deleting ingredient");
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setIngredientName("");
    setIngredientCategory("");
    setIngredientSKU("");
    setIngredientOnHand("");
    setIngredientMinStock("");
    setIngredientReorderQty("");
    setIngredientExpiryDate("");
    setIngredientUnit("kg");
  };

  const resetForm = () => {
    setIngredientName("");
    setIngredientCategory("");
    setIngredientSKU("");
    setIngredientOnHand("");
    setIngredientMinStock("");
    setIngredientReorderQty("");
    setIngredientExpiryDate("");
    setIngredientUnit("kg");
  };

  const getStockStatus = (item) => {
    const onHand = Number(item.on_hand || 0);
    const minStock = Number(item.minimum_stock || 0);

    if (onHand <= minStock) return { label: "Critical", color: "bg-red-50 text-red-700 border-red-200" };
    if (onHand <= minStock * 1.5) return { label: "Low", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    return { label: "OK", color: "bg-green-50 text-green-700 border-green-200" };
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <AdminNavbar />

      {/* HERO SECTION */}
      <div
        className="relative h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="uppercase tracking-[6px] text-gold text-sm mb-5">
            Ingredients Inventory
          </p>
          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            Inside Inventory
            <br />
            <span className="text-gold italic">Ingredients Stock</span>
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {loading ? (
          <div className="text-center text-gray-500">Loading inventory...</div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">
                    Total Ingredients
                  </p>
                  <Package size={20} className="text-gold" />
                </div>
                <h2 className="text-4xl font-bold font-serif">{stats.totalItems}</h2>
                <p className="text-xs text-gray-500 mt-2">ingredient types</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">
                    Critical Low
                  </p>
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif text-red-600">
                  {stats.criticalLow}
                </h2>
                <p className="text-xs text-gray-500 mt-2">needs reorder</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">
                    Expiring Soon
                  </p>
                  <TrendingDown size={20} className="text-orange-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif text-orange-600">
                  {stats.expiringsoon}
                </h2>
                <p className="text-xs text-gray-500 mt-2">within 30 days</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[28px] p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[2px] font-bold">
                    Total Quantity
                  </p>
                  <Package size={20} className="text-blue-500" />
                </div>
                <h2 className="text-4xl font-bold font-serif">{stats.totalValue}</h2>
                <p className="text-xs text-gray-500 mt-2">units</p>
              </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              {/* SEARCH */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search ingredients by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-[20px] border border-gray-200 focus:outline-none focus:border-gold bg-white"
                />
              </div>

              {/* FILTERS & ADD BUTTON */}
              <div className="flex gap-4 items-center">
                {/* CATEGORY FILTER */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 rounded-[20px] border border-gray-200 text-sm font-medium focus:outline-none focus:border-gold bg-white"
                >
                  <option value="All">All Ingredients</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* ADD BUTTON */}
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="px-6 py-3 bg-black text-white rounded-[20px] font-bold text-sm uppercase tracking-[0.1em] hover:bg-gold hover:text-black transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> Add Ingredient
                </button>
              </div>
            </div>

            {/* INVENTORY TABLE */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 overflow-x-auto"
            >
              <div className="mb-6">
                <p className="text-gold text-[10px] font-black tracking-[0.3em] uppercase mb-2">
                  Ingredients Stock
                </p>
                <h3 className="text-2xl font-serif font-bold">All Ingredients</h3>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Package size={40} className="mx-auto mb-4 opacity-30" />
                  <p>No items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.2em]">
                          Ingredient Name
                        </th>
                        <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.2em]">
                          SKU
                        </th>
                        <th className="px-6 py-4 text-left text-[11px] uppercase tracking-[0.2em]">
                          Type
                        </th>
                        <th className="px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em]">
                          On Hand Qty
                        </th>
                        <th className="px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em]">
                          Minimum Level
                        </th>
                        <th className="px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em]">
                          Expiry Date
                        </th>
                        <th className="px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.sku || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.category || "Other"}
                            </td>
                            <td className="px-6 py-4 text-center font-bold">
                              {Number(item.on_hand || 0)}
                            </td>
                            <td className="px-6 py-4 text-center text-gray-600">
                              {Number(item.minimum_stock || 0)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                              {item.expiry_date || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => openEdit(item)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Edit2 size={16} className="text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5 py-10">
          <div className="bg-white rounded-[35px] w-full max-w-2xl p-10 overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-100">
            <h1 className="text-4xl font-black mb-8 text-gray-900">
              {editingItem ? "Edit Ingredient" : "Add New Ingredient"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* INGREDIENT NAME */}
              {!editingItem && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ingredient Name
                  </label>
                  <input
                    type="text"
                    value={ingredientName}
                    onChange={(e) => setIngredientName(e.target.value)}
                    placeholder="e.g., All-Purpose Flour"
                    className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
              )}

              {/* TYPE */}
              {!editingItem && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ingredient Type
                  </label>
                  <input
                    type="text"
                    value={ingredientCategory}
                    onChange={(e) => setIngredientCategory(e.target.value)}
                    placeholder="e.g., Flour, Dairy, Sugar"
                    className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
              )}

              {/* SKU */}
              {!editingItem && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={ingredientSKU}
                    onChange={(e) => setIngredientSKU(e.target.value)}
                    placeholder="e.g., SKU-001"
                    className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                  />
                </div>
              )}

              {/* UNIT */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Unit of Measurement
                </label>
                <select
                  value={ingredientUnit}
                  onChange={(e) => setIngredientUnit(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="liter">Liters (L)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="units">Units</option>
                </select>
              </div>

              {/* ON HAND */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  On Hand Quantity
                </label>
                <input
                  type="number"
                  value={ingredientOnHand}
                  onChange={(e) => setIngredientOnHand(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                />
              </div>

              {/* MINIMUM STOCK */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  value={ingredientMinStock}
                  onChange={(e) => setIngredientMinStock(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                />
              </div>

              {/* REORDER QUANTITY */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reorder Quantity
                </label>
                <input
                  type="number"
                  value={ingredientReorderQty}
                  onChange={(e) => setIngredientReorderQty(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                />
              </div>

              {/* EXPIRY DATE */}
              <div>ngredient" : "Add Ingredient
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={ingredientExpiryDate}
                  onChange={(e) => setIngredientExpiryDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-[0.1em] hover:bg-gold hover:text-black transition-all"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button
                onClick={closeModals}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-900 rounded-2xl font-bold uppercase tracking-[0.1em] hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
