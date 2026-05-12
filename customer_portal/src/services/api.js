// src/services/api.js
const BASE_URL = 'http://localhost/pastry_system/customer';

export const api = {
  getProducts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api_products.php?action=list`);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },
  // Magdagdag dito ng postOrder, login, etc. later
};