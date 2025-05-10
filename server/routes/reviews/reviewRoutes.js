import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  createReview,
  getFreelancerReviews,
  updateReview,
  deleteReview,
} from '../../controllers/reviews/reviewController.js';
import { respondToReview } from '../../controllers/reviews/reviewController.js';

const router = express.Router();

// ─── Client creates a review ────────────────────────────
router.post('/', protect, authorize('client'), createReview);

// ─── Get all reviews for a freelancer ───────────────────
router.get('/freelancer/:freelancerId', protect, getFreelancerReviews); 

// ─── Client updates their review ────────────────────────
router.put('/:id', protect, authorize('client'), updateReview);

// ─── Client deletes their review ────────────────────────
router.delete('/:id', protect, authorize('client'), deleteReview);

router.put('/:id/respond', protect, respondToReview);

export default router;
