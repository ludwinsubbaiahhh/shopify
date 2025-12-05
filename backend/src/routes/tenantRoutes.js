import express from 'express';
import {
  createTenant,
  getTenants,
  getTenantById,
  syncTenant,
} from '../controllers/tenantController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createTenant);
router.get('/', getTenants);
router.get('/:id', getTenantById);
router.post('/:id/sync', syncTenant);

export default router;

