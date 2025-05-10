import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  placeBid,
  updateBid,
  getBidsForProject,
  getMyBids,
  counterOffer, // ✅ import added
  getBidAnalytics,
  getFreelancerBidAnalytics,
} from '../../controllers/projects/bidController.js';

const router = express.Router();

// ─── Freelancer Places a Bid ───────────────────────────
router.post('/:projectId/bids', protect, authorize('freelancer'), placeBid);

// ─── Freelancer Updates Their Bid ──────────────────────
router.put('/bid/:bidId', protect, authorize('freelancer'), updateBid);

router.get('/freelancer/analytics', protect, authorize('freelancer'), getFreelancerBidAnalytics);


// ─── Client Sends a Counter-Offer ──────────────────────
router.put('/bid/:bidId/counter', protect, authorize('client'), counterOffer); // ✅ new route

// ─── Anyone can view all bids on a project ──────────────
router.get('/:projectId/bids', getBidsForProject);

// ─── Freelancer Views Their Own Bids ────────────────────
router.get('/freelancer/my-bids', protect, authorize('freelancer'), getMyBids);

router.get('/analytics/summary', protect, authorize('admin'), getBidAnalytics);


export default router;
