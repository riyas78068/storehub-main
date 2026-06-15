import { apiClient } from './apiClient';

// Get all products
export const getAllProducts = async () => {
  try {
    return await apiClient.get('/products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    return await apiClient.get(`/products/${id}`);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    return await apiClient.post('/admin', productData);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    return await apiClient.put(`/admin/${id}`, productData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    return await apiClient.delete(`/admin/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
