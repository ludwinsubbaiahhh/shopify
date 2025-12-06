import { createCustomEvent, getCustomEvents } from '../services/syncService.js';

/**
 * Create a custom event (webhook endpoint)
 * This can be called by Shopify webhooks or manually
 */
export async function createEvent(req, res) {
  try {
    const { tenantId } = req;
    const { eventType, customerId, orderId, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }

    // Validate event type
    const validEventTypes = ['cart_abandoned', 'checkout_started', 'checkout_completed', 'product_viewed'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ 
        error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` 
      });
    }

    const event = await createCustomEvent(tenantId, eventType, customerId, orderId, metadata);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get custom events for a tenant
 */
export async function getEvents(req, res) {
  try {
    const { tenantId } = req;
    const { eventType, startDate, endDate } = req.query;

    const events = await getCustomEvents(tenantId, eventType, startDate, endDate);

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

