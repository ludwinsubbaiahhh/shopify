import express from 'express';
import {
  getDashboardInsights,
  getOrders,
} from '../controllers/insightsController.js';
import { authenticate, requireTenant } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

router.get('/dashboard', getDashboardInsights);
router.get('/orders', getOrders);

export default router;

