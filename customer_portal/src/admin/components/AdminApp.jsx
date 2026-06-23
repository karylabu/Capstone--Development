import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";

export default function AdminApp() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="orders" element={<Orders />} />
      <Route path="products" element={<Products />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="reports" element={<Reports />} />
    </Routes>
  );
}
