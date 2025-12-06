import express from 'express';
import { createEvent, getEvents } from '../controllers/eventController.js';
import { authenticate, requireTenant } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

router.post('/', createEvent);
router.get('/', getEvents);

export default router;

