import Freelancer from '../../models/Freelancer.js';

export const getFreelancers = async (req, res) => {
  try {
    const { minRating, expertise, minExperience } = req.query;

    // Build query filters
    const filters = { verified: true };
    if (expertise) filters.expertise = expertise;
    if (minExperience) filters.experience = { $gte: parseInt(minExperience) };

    // Fetch all matching freelancers
    let freelancers = await Freelancer.find(filters)
      .populate('user', 'name email')
      .lean(); // convert to plain JS objects for in-memory filtering

    // Filter by rating (done in memory)
    if (minRating) {
      freelancers = freelancers.filter(
        (f) => (f.rating || 0) >= parseFloat(minRating)
      );
    }

    res.status(200).json({ success: true, freelancers });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Error fetching freelancers' });
  }
};
