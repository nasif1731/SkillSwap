import express from 'express';
import { signup, login, verify, resetPassword } from '../../controllers/auth/authController.js';
import { sendOtp, verifyOtp } from '../../controllers/auth/authController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// ─── Real Auth Routes ───────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', verify);
router.post('/reset-password', resetPassword);
router.post('/send-otp', protect, sendOtp);
router.post('/verify-otp', protect, verifyOtp);


export default router;
