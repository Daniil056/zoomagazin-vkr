import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Отключаем cookies для разработки
});

// Категории
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getBySlug: (slug) => api.get(`/categories/${slug}/`),
};

// Товары
export const productsAPI = {
  getAll: () => api.get('/products/'),
  getBySlug: (slug) => api.get(`/products/${slug}/`),
  getByCategory: (categorySlug) => api.get(`/products/by_category/?category_slug=${categorySlug}`),
  getByPetType: (petType) => api.get(`/products/by_pet_type/?pet_type=${petType}`),
  search: (query) => api.get(`/products/search/?q=${query}`),
};

// 🛒 КОРЗИНА — ПРОСТОЙ ИНТЕРФЕЙС
export const cartAPI = {
  getCart: () => api.get('/cart/'),
  
  addItem: (productId, quantity = 1) => 
    api.post('/cart/', { 
      action: 'add', 
      product_id: productId, 
      quantity: quantity 
    }),
  
  removeItem: (productId) => 
    api.post('/cart/', { 
      action: 'remove', 
      product_id: productId 
    }),
  
  updateQuantity: (productId, quantity) => 
    api.post('/cart/', { 
      action: 'update', 
      product_id: productId, 
      quantity: quantity 
    }),
  
  clearCart: () => 
    api.post('/cart/', { action: 'clear' }),
};

// Заказы
export const ordersAPI = {
  getAll: () => api.get('/orders/'),
  create: (data) => api.post('/orders/', data),
};

// Тестовый эндпоинт для отладки
export const testAPI = {
  cart: (data) => api.post('/test-cart/', data),
};

export default api;