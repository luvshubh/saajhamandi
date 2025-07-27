import axios from "axios";

// Check if we should use mock API to avoid network errors
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL); // Debugging line to check API base URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { token: "mock-token", user: { name: "Mock User" } },
      });
    }
    return api.post("/api/auth/login", credentials);
  },
  register: (userData) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { token: "mock-token", user: { name: userData.name } },
      });
    }
    return api.post("/api/auth/register", userData);
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: [] });
    }
    return api.get("/api/recommendations");
  },
};

// Forecast API
export const forecastAPI = {
  getPriceForecast: (item, city) => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: {} });
    }
    return api.post("/api/forecast", { item, city });
  },
};

// Wholesaler API
export const wholesalerAPI = {
  matchWholesalers: (items) => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: [] });
    }
    return api.post("/api/match-wholesalers", { items });
  },
};

// Deals API
export const dealsAPI = {
  getActiveDeals: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: [] });
    }
    return api.get("/api/deals");
  },
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: [] });
    }
    return api.get("/api/orders/my-orders");
  },
  createOrder: (orderData) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: { id: "mock-order-id", status: "created" },
      });
    }
    return api.post("/api/orders", orderData);
  },
};

export const fetchDashboardData = async () => {
  try {
    const response = await fetch("/api/dashboard");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export default api;