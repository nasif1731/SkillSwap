import express from 'express';
import { getFreelancers } from '../../controllers/user/userController.js';
import { protect } from '../../middleware/authMiddleware.js';
import User from '../../models/User.js';

const router = express.Router();

// ✅ Fetch all verified freelancers
router.get('/freelancers', protect, getFreelancers);

// ✅ Resolve user IDs to names
router.post('/resolve-users', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid request: ids must be an array' });
    }

    const users = await User.find({ _id: { $in: ids } }).select('_id name');
    res.json({ users });
  } catch (err) {
    console.error('Error resolving users:', err);
    res.status(500).json({ message: 'Failed to resolve users' });
  }
});

export default router;
