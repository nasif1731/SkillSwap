import Freelancer from '../../models/Freelancer.js';
import User from '../../models/User.js';
import Project from '../../models/Project.js';
import Bid from '../../models/Bid.js';

// ─── Get Pending Freelancers ─────────────────────────────
export const getPendingFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find({ verified: false }).populate('user', 'name email');
    res.status(200).json({ success: true, freelancers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Verify Freelancer ───────────────────────────────────
export const verifyFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { level } = req.body; // Optional: Verified / Premium

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    freelancer.verified = true;
    if (level) {
      freelancer.verificationLevel = level;
    }

    await freelancer.save();

    res.status(200).json({ success: true, freelancer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// ─── Reject Freelancer ───────────────────────────────────
export const rejectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    await Freelancer.findByIdAndDelete(freelancerId);

    res.status(200).json({ success: true, message: 'Freelancer rejected and deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Platform Analytics ──────────────────────────────────
export const getPlatformAnalytics = async (req, res) => {
  try {
    // 1. Total counts
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const totalProjects = await Project.countDocuments();
    const totalBids = await Bid.countDocuments();
    const averageBidsPerProject = totalProjects > 0 ? (totalBids / totalProjects).toFixed(2) : 0;

    // 2. Revenue (mock based on $100 per project)
    const totalEarnings = totalProjects * 100;

    // 3. Monthly user signup trend (last 4 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trend = userGrowth.map((entry) => ({
      month: getMonthName(entry._id),
      users: entry.count,
    }));

    // 4. Top 5 popular freelancer skills
    const popularSkills = await Freelancer.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      users: totalClients + totalFreelancers,
      clients: totalClients,
      freelancers: totalFreelancers,
      projects: totalProjects,
      bids: totalBids,
      averageBidsPerProject,
      earnings: totalEarnings,
      trend,
      popularSkills,
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper: Month name
function getMonthName(monthNum) {
  const months = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[monthNum] || 'N/A';
}
