import axios from 'axios';
import { getShopifyApiUrl, getShopifyHeaders } from '../config/shopify.js';

/**
 * Fetch customers from Shopify
 */
export async function fetchCustomers(shopifyDomain, accessToken, limit = 250) {
  try {
    const url = getShopifyApiUrl(shopifyDomain, `/customers.json?limit=${limit}`);
    const response = await axios.get(url, {
      headers: getShopifyHeaders(accessToken),
    });
    return response.data.customers || [];
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    throw error;
  }
}

/**
 * Fetch orders from Shopify
 */
export async function fetchOrders(shopifyDomain, accessToken, limit = 250, sinceId = null) {
  try {
    let url = getShopifyApiUrl(shopifyDomain, `/orders.json?limit=${limit}&status=any`);
    if (sinceId) {
      url += `&since_id=${sinceId}`;
    }
    const response = await axios.get(url, {
      headers: getShopifyHeaders(accessToken),
    });
    return response.data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    throw error;
  }
}

/**
 * Fetch products from Shopify
 */
export async function fetchProducts(shopifyDomain, accessToken, limit = 250) {
  try {
    const url = getShopifyApiUrl(shopifyDomain, `/products.json?limit=${limit}`);
    const response = await axios.get(url, {
      headers: getShopifyHeaders(accessToken),
    });
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
}

/**
 * Fetch all data with pagination
 */
export async function fetchAllCustomers(shopifyDomain, accessToken) {
  const allCustomers = [];
  let hasNextPage = true;
  let sinceId = null;

  while (hasNextPage) {
    const customers = await fetchCustomers(shopifyDomain, accessToken);
    if (customers.length === 0) break;
    
    allCustomers.push(...customers);
    sinceId = customers[customers.length - 1].id;
    
    // Check if we got less than limit, meaning no more pages
    if (customers.length < 250) {
      hasNextPage = false;
    }
  }

  return allCustomers;
}

export async function fetchAllOrders(shopifyDomain, accessToken) {
  const allOrders = [];
  let hasNextPage = true;
  let sinceId = null;

  while (hasNextPage) {
    const orders = await fetchOrders(shopifyDomain, accessToken, 250, sinceId);
    if (orders.length === 0) break;
    
    allOrders.push(...orders);
    sinceId = orders[orders.length - 1].id;
    
    if (orders.length < 250) {
      hasNextPage = false;
    }
  }

  return allOrders;
}

export async function fetchAllProducts(shopifyDomain, accessToken) {
  const allProducts = [];
  let hasNextPage = true;
  let sinceId = null;

  while (hasNextPage) {
    const products = await fetchProducts(shopifyDomain, accessToken);
    if (products.length === 0) break;
    
    allProducts.push(...products);
    sinceId = products[products.length - 1].id;
    
    if (products.length < 250) {
      hasNextPage = false;
    }
  }

  return allProducts;
}

