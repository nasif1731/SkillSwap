import express from 'express';
import {
  getAllFreelancers,
  getFreelancerById,
  updateFreelancerProfile,
  deleteFreelancerProfile,
  getOwnFreelancerProfile
} from '../../controllers/freelancer/freelancerController.js';
import { getProfileCompleteness } from '../../controllers/freelancer/freelancerController.js';



import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.get('/me', protect, authorize('freelancer'), getOwnFreelancerProfile);
router.get('/', getAllFreelancers); // /api/freelancers
router.get('/:userId', getFreelancerById); // /api/freelancers/:userId ✅ updated meaning
router.put('/profile', protect, authorize('freelancer'), updateFreelancerProfile);
router.get('/profile/completeness', protect, authorize('freelancer'), getProfileCompleteness);
router.delete('/profile', protect, authorize('freelancer'), deleteFreelancerProfile);



export default router;
