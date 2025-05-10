// controllers/freelancerController.js
import mongoose from 'mongoose'; // ⬅️ Add this at the top
import asyncHandler from 'express-async-handler';
import Freelancer from '../../models/Freelancer.js';
import User from '../../models/User.js';

// @desc    Get all freelancers
// @route   GET /api/freelancers
// @access  Public
export const getAllFreelancers = asyncHandler(async (req, res) => {
  const freelancers = await Freelancer.find().populate('user', 'name email');
  res.status(200).json(freelancers);
});

// @desc    Get freelancer by ID
// @route   GET /api/freelancers/:freelancerId
// @access  Public
export const getFreelancerById = asyncHandler(async (req, res) => {
  const rawId = req.params.userId;
  console.log('📥 Incoming request for userId:', rawId);

  let userId;
  try {
    userId = new mongoose.Types.ObjectId(rawId);
  } catch (e) {
    console.log('❌ Invalid ObjectId:', rawId);
    return res.status(400).json({ message: 'Invalid ObjectId' });
  }

  const all = await Freelancer.find().lean();
  console.log('📦 All freelancers user IDs:', all.map(f => f.user.toString()));

  const freelancer = await Freelancer.findOne({ user: userId }).populate('user', 'name email');

  if (!freelancer) {
    console.log('⚠️ No freelancer matched for user ID:', userId.toString());
    return res.status(404).json({ message: 'Freelancer not found' });
  }

  console.log('✅ Freelancer found:', freelancer._id.toString());
  res.status(200).json(freelancer);
});

// @desc    Create or update freelancer profile
// @route   PUT /api/freelancers/profile
// @access  Private (freelancer)
export const updateFreelancerProfile = asyncHandler(async (req, res) => {
  const { skills, expertise, experience, portfolio } = req.body;
  const userId = req.user._id;

  let freelancer = await Freelancer.findOne({ user: userId });

  if (freelancer) {
    // Update existing
    freelancer.skills = skills || freelancer.skills;
    freelancer.expertise = expertise || freelancer.expertise;
    freelancer.experience = experience || freelancer.experience;
    freelancer.portfolio = portfolio || freelancer.portfolio;
  } else {
    // Create new
    freelancer = new Freelancer({
      user: userId,
      skills,
      expertise,
      experience,
      portfolio,
    });
  }

  const saved = await freelancer.save();
  res.status(200).json(saved);
});

// @desc    Delete freelancer profile
// @route   DELETE /api/freelancers/profile
// @access  Private (freelancer)
export const deleteFreelancerProfile = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findOne({ user: req.user._id });

  if (!freelancer) {
    res.status(404);
    throw new Error('Freelancer profile not found');
  }

  await freelancer.deleteOne();
  res.status(200).json({ message: 'Freelancer profile deleted' });
});

export const getOwnFreelancerProfile = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findOne({ user: req.user._id }).populate('user', 'name email');

  if (!freelancer) {
    return res.status(404).json({ message: 'Freelancer profile not found' });
  }

  res.status(200).json(freelancer);
});

export const getProfileCompleteness = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findOne({ user: req.user._id });

  if (!freelancer) {
    return res.status(404).json({ message: 'Freelancer profile not found' });
  }

  const totalFields = 4;
  let filled = 0;

  if (freelancer.skills && freelancer.skills.length > 0) filled++;
  if (freelancer.expertise && freelancer.expertise.trim() !== '') filled++;
  if (freelancer.experience && freelancer.experience.trim() !== '') filled++;
  if (freelancer.portfolio && freelancer.portfolio.trim() !== '') filled++;

  const percentage = Math.round((filled / totalFields) * 100);

  res.status(200).json({ completeness: percentage });
});

