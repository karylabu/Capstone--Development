// src/services/api.js
import { CUSTOMER_BASE } from './config';

const BASE_URL = CUSTOMER_BASE;

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
  // Add other centralized API helpers here
};