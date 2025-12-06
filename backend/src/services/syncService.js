import prisma from '../config/database.js';
import {
  fetchAllCustomers,
  fetchAllOrders,
  fetchAllProducts,
} from './shopifyService.js';

/**
 * Sync customers from Shopify to database
 */
export async function syncCustomers(tenantId, shopifyDomain, accessToken) {
  try {
    const shopifyCustomers = await fetchAllCustomers(shopifyDomain, accessToken);
    const syncedCount = { created: 0, updated: 0 };

    // Get all orders to extract customer names from billing addresses
    const shopifyOrders = await fetchAllOrders(shopifyDomain, accessToken);
    const customerNamesFromOrders = new Map();
    
    // Extract names from order billing addresses
    shopifyOrders.forEach(order => {
      if (order.customer && order.billing_address) {
        const customerId = order.customer.id.toString();
        if (!customerNamesFromOrders.has(customerId)) {
          customerNamesFromOrders.set(customerId, {
            firstName: order.billing_address.first_name || order.customer.first_name || null,
            lastName: order.billing_address.last_name || order.customer.last_name || null,
          });
        }
      }
    });

    for (const shopifyCustomer of shopifyCustomers) {
      // Try to get name from customer, then from orders
      const orderNameData = customerNamesFromOrders.get(shopifyCustomer.id.toString());
      
      const customerData = {
        tenantId,
        shopifyId: shopifyCustomer.id.toString(),
        email: shopifyCustomer.email || null,
        firstName: shopifyCustomer.first_name || orderNameData?.firstName || null,
        lastName: shopifyCustomer.last_name || orderNameData?.lastName || null,
        phone: shopifyCustomer.phone || null,
        totalSpent: parseFloat(shopifyCustomer.total_spent || 0),
        ordersCount: shopifyCustomer.orders_count || 0,
        syncedAt: new Date(),
      };

      const existing = await prisma.customer.findUnique({
        where: {
          tenantId_shopifyId: {
            tenantId,
            shopifyId: shopifyCustomer.id.toString(),
          },
        },
      });

      if (existing) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: customerData,
        });
        syncedCount.updated++;
      } else {
        await prisma.customer.create({ data: customerData });
        syncedCount.created++;
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing customers:', error);
    throw error;
  }
}

/**
 * Sync orders from Shopify to database
 */
export async function syncOrders(tenantId, shopifyDomain, accessToken) {
  try {
    const shopifyOrders = await fetchAllOrders(shopifyDomain, accessToken);
    const syncedCount = { created: 0, updated: 0 };

    for (const shopifyOrder of shopifyOrders) {
      // Find customer if exists
      let customerId = null;
      if (shopifyOrder.customer) {
        const customer = await prisma.customer.findUnique({
          where: {
            tenantId_shopifyId: {
              tenantId,
              shopifyId: shopifyOrder.customer.id.toString(),
            },
          },
        });
        customerId = customer?.id || null;
      }

      const orderData = {
        tenantId,
        shopifyId: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.order_number?.toString() || null,
        customerId,
        totalPrice: parseFloat(shopifyOrder.total_price || 0),
        subtotalPrice: parseFloat(shopifyOrder.subtotal_price || 0),
        totalTax: parseFloat(shopifyOrder.total_tax || 0),
        currency: shopifyOrder.currency || 'USD',
        financialStatus: shopifyOrder.financial_status || null,
        fulfillmentStatus: shopifyOrder.fulfillment_status || null,
        orderDate: new Date(shopifyOrder.created_at),
        syncedAt: new Date(),
      };

      const existing = await prisma.order.findUnique({
        where: {
          tenantId_shopifyId: {
            tenantId,
            shopifyId: shopifyOrder.id.toString(),
          },
        },
      });

      if (existing) {
        await prisma.order.update({
          where: { id: existing.id },
          data: orderData,
        });
        syncedCount.updated++;
      } else {
        await prisma.order.create({ data: orderData });
        syncedCount.created++;
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing orders:', error);
    throw error;
  }
}

/**
 * Sync products from Shopify to database
 */
export async function syncProducts(tenantId, shopifyDomain, accessToken) {
  try {
    const shopifyProducts = await fetchAllProducts(shopifyDomain, accessToken);
    const syncedCount = { created: 0, updated: 0 };

    for (const shopifyProduct of shopifyProducts) {
      const productData = {
        tenantId,
        shopifyId: shopifyProduct.id.toString(),
        title: shopifyProduct.title,
        handle: shopifyProduct.handle || null,
        vendor: shopifyProduct.vendor || null,
        productType: shopifyProduct.product_type || null,
        status: shopifyProduct.status || null,
        syncedAt: new Date(),
      };

      const existing = await prisma.product.findUnique({
        where: {
          tenantId_shopifyId: {
            tenantId,
            shopifyId: shopifyProduct.id.toString(),
          },
        },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
        syncedCount.updated++;
      } else {
        await prisma.product.create({ data: productData });
        syncedCount.created++;
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

/**
 * Full sync for a tenant (customers, orders, products)
 */
export async function syncTenantData(tenantId) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.shopifyAccessToken) {
      throw new Error('Tenant not found or missing access token');
    }

    const results = {
      customers: { created: 0, updated: 0 },
      orders: { created: 0, updated: 0 },
      products: { created: 0, updated: 0 },
    };

    // Sync in parallel
    const [customersResult, ordersResult, productsResult] = await Promise.all([
      syncCustomers(tenantId, tenant.shopifyDomain, tenant.shopifyAccessToken),
      syncOrders(tenantId, tenant.shopifyDomain, tenant.shopifyAccessToken),
      syncProducts(tenantId, tenant.shopifyDomain, tenant.shopifyAccessToken),
    ]);

    results.customers = customersResult;
    results.orders = ordersResult;
    results.products = productsResult;

    // Update tenant sync timestamp
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { updatedAt: new Date() },
    });

    return results;
  } catch (error) {
    console.error('Error syncing tenant data:', error);
    throw error;
  }
}

