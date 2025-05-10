import express from 'express';
import { getClientAnalytics } from '../../controllers/analytics/clientAnalyticsController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/client-dashboard', protect, authorize('client'), getClientAnalytics);

export default router;