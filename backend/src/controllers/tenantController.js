import prisma from '../config/database.js';
import { syncTenantData } from '../services/syncService.js';

/**
 * Create a new tenant (Shopify store)
 */
export async function createTenant(req, res) {
  try {
    const { name, shopifyDomain, shopifyAccessToken, shopifyApiKey, shopifyApiSecret } = req.body;

    if (!name || !shopifyDomain) {
      return res.status(400).json({ error: 'Name and shopifyDomain are required' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyDomain,
        shopifyAccessToken: shopifyAccessToken || null,
        shopifyApiKey: shopifyApiKey || null,
        shopifyApiSecret: shopifyApiSecret || null,
      },
    });

    res.status(201).json(tenant);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Tenant with this domain already exists' });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all tenants
 */
export async function getTenants(req, res) {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        shopifyDomain: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(req, res) {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Trigger manual sync for a tenant
 */
export async function syncTenant(req, res) {
  try {
    const { id } = req.params;
    const results = await syncTenantData(id);
    res.json({ message: 'Sync completed', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

