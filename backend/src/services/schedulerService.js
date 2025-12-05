import cron from 'node-cron';
import { syncTenantData } from './syncService.js';
import prisma from '../config/database.js';

/**
 * Schedule automatic sync for all active tenants
 * Runs every hour by default
 */
export function startScheduler(cronExpression = '0 * * * *') {
  console.log(`🕐 Scheduler started with expression: ${cronExpression}`);

  cron.schedule(cronExpression, async () => {
    console.log('🔄 Running scheduled sync for all tenants...');
    
    try {
      const activeTenants = await prisma.tenant.findMany({
        where: { isActive: true },
        select: { id: true, name: true, shopifyDomain: true },
      });

      console.log(`Found ${activeTenants.length} active tenants`);

      for (const tenant of activeTenants) {
        try {
          console.log(`Syncing tenant: ${tenant.name} (${tenant.shopifyDomain})`);
          await syncTenantData(tenant.id);
          console.log(`✅ Successfully synced tenant: ${tenant.name}`);
        } catch (error) {
          console.error(`❌ Error syncing tenant ${tenant.name}:`, error.message);
        }
      }

      console.log('✅ Scheduled sync completed');
    } catch (error) {
      console.error('❌ Error in scheduled sync:', error);
    }
  });
}

