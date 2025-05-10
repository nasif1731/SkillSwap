import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  getPendingFreelancers,
  verifyFreelancer,
  rejectFreelancer,
  getPlatformAnalytics
} from '../../controllers/admin/adminController.js';

const router = express.Router();

// ─── Admin Protected Routes ─────────────────────────────
router.get('/pending-freelancers', protect, authorize('admin'), getPendingFreelancers);
router.put('/verify-freelancer/:freelancerId', protect, authorize('admin'), verifyFreelancer);
router.delete('/reject-freelancer/:freelancerId', protect, authorize('admin'), rejectFreelancer);
router.get('/analytics', protect, authorize('admin'), getPlatformAnalytics);

export default router;
