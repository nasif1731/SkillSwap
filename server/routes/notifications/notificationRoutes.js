import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  sendNotification,
  getMyNotifications,
  markAsRead
} from '../../controllers/notifications/notificationController.js';

const router = express.Router();

// ─── Protected Routes ─────────────────────────────────
router.post('/', protect, sendNotification);
router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
