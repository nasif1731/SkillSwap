import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversation,
  markMessageAsRead,
  getConversations,
} from '../../controllers/messages/messageController.js';

const router = express.Router();

// ✅ Get all recent conversations
router.get('/conversations', protect, getConversations);

// ✅ Send a new message
router.post('/', protect, sendMessage);

// ✅ Get a conversation between logged-in user and another
router.get('/:userId', protect, getConversation);

// ✅ Mark a specific message as read
router.put('/:id/read', protect, markMessageAsRead);

export default router;
