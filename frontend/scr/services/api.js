import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const categoryService = {
    getAll: () => api.get('/categories/'),
    getBySlug: (slug) => api.get(`/categories/${slug}/`),
};

export const productService = {
    getAll: (params) => api.get('/products/', { params }),
    getBySlug: (slug) => api.get(`/products/${slug}/`),
    addReview: (productId, data) => 
        api.post(`/products/${productId}/add_review/`, data),
};

export const cartService = {
    get: () => api.get('/cart/'),
    addItem: (productId, quantity = 1) => 
        api.post('/cart/add_item/', { product_id: productId, quantity }),
    removeItem: (productId) => 
        api.post('/cart/remove_item/', { product_id: productId }),
    updateQuantity: (productId, quantity) => 
        api.post('/cart/update_quantity/', { product_id: productId, quantity }),
    clear: () => api.post('/cart/clear/'),
};

export const orderService = {
    getAll: () => api.get('/orders/'),
    create: (data) => api.post('/orders/', data),
    getById: (id) => api.get(`/orders/${id}/`),
};

export const reviewService = {
    getAll: (productId) => 
        api.get('/reviews/', { params: { product_id: productId } }),
};

export default api;