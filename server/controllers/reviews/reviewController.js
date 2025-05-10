import Review from '../../models/Review.js';
import Project from '../../models/Project.js'; 
import Freelancer from '../../models/Freelancer.js';
import asyncHandler from 'express-async-handler';

// ─── Create a Review ───────────────────────────────────
export const createReview = async (req, res) => {
  try {
    console.log("📥 Incoming review request:", req.body);
    console.log("🔐 Authenticated user:", req.user);
    const { projectId, freelancerId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this project' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed projects' });
    }

    const existingReview = await Review.findOne({
      project: projectId,
      client: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this project' });
    }

    const review = await Review.create({
      project: projectId,
      client: req.user._id,
      freelancer: freelancerId,
      rating,
      comment,
    });

    const allReviews = await Review.find({ freelancer: freelancerId });
    const reviewCount = allReviews.length;
    const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRating / reviewCount;

    await Freelancer.findByIdAndUpdate(freelancerId, {
      averageRating: averageRating.toFixed(1),
      reviewCount,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Reviews for a Freelancer ───────────────────────
export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const reviews = await Review.find({ freelancer: freelancerId })
      .sort({ createdAt: -1 })
      .populate('client', 'name');

    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : null;

    res.status(200).json({
      success: true,
      reviews,
      averageRating,
      reviewCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Update a Review ─────────────────────────────────────
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Delete a Review ─────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.client || review.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(review._id); // ✅

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('❌ Delete Review Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// ─── Freelancer Responds to Review ─────────────────────
export const respondToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('freelancer');

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Ensure freelancer exists and is linked to the user
  const freelancer = await Freelancer.findById(review.freelancer).lean();
  if (!freelancer) {
    return res.status(404).json({ message: 'Freelancer not found' });
  }

  console.log('🧠 Freelancer.user ID:', freelancer.user.toString());
  console.log('🔐 Logged-in user ID:', req.user._id.toString());

  if (req.user._id.toString() !== freelancer.user.toString()) {
    return res.status(403).json({ message: 'Not authorized to respond to this review' });
  }

  review.response = req.body.response;
  await review.save();

  res.status(200).json({ success: true, message: 'Response added' });
});
