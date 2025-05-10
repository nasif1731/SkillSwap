import User from '../../models/User.js';
import Freelancer from '../../models/Freelancer.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';
import Otp from '../../models/Otp.js';

// ─── Signup ─────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, skills, expertise, experience } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false, // Not verified initially
    });

    // 🔥 If registering as a freelancer, create a profile too
    if (role === 'freelancer') {
      await Freelancer.create({
        user: user._id,
        skills: skills || [],
        expertise: expertise || '',
        experience: experience || '',
        verified: false,
        verificationLevel: 'Basic',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Login ──────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Verify Email or Phone ───────────────────────────────
export const verify = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required for verification' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'User verified successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Reset Password ─────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Generate OTP (helper)
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const otpCode = generateOtp();

    // OTP expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60000);

    // Save OTP clearly
    await Otp.create({ userId: req.user._id, phone, otp: otpCode, expiresAt });

    // Simulate sending OTP via SMS (Twilio mock)
    console.log(`Mock OTP sent to ${phone}: ${otpCode}`);

    res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = await Otp.findOne({ userId: req.user._id, phone, otp });

    if (!record) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    await User.findByIdAndUpdate(req.user._id, { isVerified: true });
    await Otp.deleteMany({ userId: req.user._id }); // cleanup

    res.status(200).json({ message: 'Phone verified successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
