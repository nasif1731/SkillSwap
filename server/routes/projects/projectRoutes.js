import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  acceptBid,
  updateProjectProgress
} from '../../controllers/projects/projectController.js';
import { markComplete } from '../../controllers/projects/projectController.js';
import { getFreelancerProjects } from '../../controllers/projects/projectController.js';

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────
router.get('/', getProjects);
router.get('/my-projects', protect, authorize('client'), getMyProjects);
router.get('/:id', getProjectById);

// ─── Protected Client Routes ───────────────────────────────
router.post('/', protect, authorize('client'), createProject);
router.put('/:id', protect, authorize('client'), updateProject);
router.delete('/:id', protect, authorize('client'), deleteProject);
router.put('/accept-bid/:id', protect, acceptBid);
router.put('/:id/mark-complete', protect, authorize('client'), markComplete);
router.get('/freelancer/my-projects', protect, authorize('freelancer'), getFreelancerProjects);
router.put('/:id/progress', protect, authorize('freelancer'), updateProjectProgress);

export default router;
