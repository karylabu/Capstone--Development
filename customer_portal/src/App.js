import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

/* =========================
   CUSTOMER
========================= */
import CustomerApp from './customer/components/CustomerApp';

/* =========================
   STAFF PAGES
========================= */
import DashboardStaff from './staff/pages/DashboardStaff';
import Orders from './staff/pages/Orders';
import Products from './staff/pages/Products'; // (if you already created this)
import Customers from './staff/pages/Customers';

/* =========================
   MAIN APP ROUTER
========================= */
function App() {

  return (

    <Router>

      <Routes>

        {/* =========================
           CUSTOMER ROUTES
        ========================= */}
        <Route
          path="/pastry_system/customer/*"
          element={<CustomerApp />}
        />

        {/* =========================
           STAFF DASHBOARD
        ========================= */}
        <Route
          path="/pastry_system/staff"
          element={<DashboardStaff />}
        />

        {/* =========================
           STAFF ORDERS
        ========================= */}
        <Route
          path="/pastry_system/staff/orders"
          element={<Orders />}
        />

        {/* =========================
           STAFF PRODUCTS (INVENTORY)
        ========================= */}
        <Route
          path="/pastry_system/staff/products"
          element={<Products />}
        />

        {/* =========================
           STAFF CUSTOMERS
        ========================= */}
        <Route
          path="/pastry_system/staff/customers"
          element={<Customers />}
        />

      </Routes>

    </Router>

  );

}

export default App;