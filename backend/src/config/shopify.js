export const SHOPIFY_CONFIG = {
  API_VERSION: process.env.SHOPIFY_API_VERSION || '2025-10',
  API_LIMIT: 250, // Shopify API limit per request
};

/**
 * Build Shopify API URL
 */
export function getShopifyApiUrl(shopifyDomain, endpoint) {
  return `https://${shopifyDomain}/admin/api/${SHOPIFY_CONFIG.API_VERSION}${endpoint}`;
}

/**
 * Get Shopify API headers with authentication
 */
export function getShopifyHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  };
}

