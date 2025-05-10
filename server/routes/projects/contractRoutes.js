import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  createContract,
  getContractByProject,
  updateContract,
  signContract
} from '../../controllers/projects/contractController.js';

const router = express.Router();

// ─── Contract Routes ────────────────────────────────────
router.post('/', protect, createContract);
router.get('/:projectId', protect, getContractByProject);
router.put('/:id', protect, updateContract);
router.post('/:id/sign', protect, signContract);

export default router;
