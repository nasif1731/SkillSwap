import Project from '../../models/Project.js';
import Review from '../../models/Review.js';
import User from '../../models/User.js';
import Freelancer from '../../models/Freelancer.js';
import mongoose from 'mongoose';

export const getClientAnalytics = async (req, res) => {
    try {
        console.log("🔍 Query received:", req.query);
        console.log("👤 Authenticated client ID:", req.user?._id);
        const clientId = req.user._id;
        const { from, to } = req.query;

        // Optional validation (guard against invalid date strings)
        if (from && isNaN(Date.parse(from))) {
            return res.status(400).json({ message: 'Invalid "from" date' });
        }

        if (to && isNaN(Date.parse(to))) {
            return res.status(400).json({ message: 'Invalid "to" date' });
        }

        // Build dynamic match stage
        const matchStage = { client: clientId };

        if (from && to) {
            matchStage.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to),
            };
        }

        const projects = await Project.find(matchStage);

        const activeProjects = projects.filter((p) => p.status === 'in-progress');
        const completedProjects = projects.filter((p) => p.status === 'completed');

        // Gather freelancer stats
        const freelancerIds = [
            ...new Set(
                completedProjects
                    .map((p) => p.freelancer)
                    .filter(Boolean) // remove null/undefined
                    .map((id) => id.toString())
            ),
        ];
        console.log("📦 Total Projects Found:", projects.length);
        console.log("👷 Freelancers involved:", freelancerIds);
        const stats = await Promise.all(
            freelancerIds.map(async (freelancerId) => {
                const freelancerProjects = completedProjects.filter(
                    (p) => p.freelancer && p.freelancer.toString() === freelancerId
                );

                const reviews = await Review.find({ freelancer: freelancerId });
                const avgRating =
                    reviews.length > 0
                        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
                        : 0;

                const freelancerDoc = await Freelancer.findById(freelancerId).populate('user', 'name');
                const name = freelancerDoc?.user?.name || 'Unknown';

                return {
                    name,
                    projects: freelancerProjects.length,
                    avgRating,
                };
            })
        );

        res.status(200).json({
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            freelancerStats: stats,
        });
    } catch (err) {
        console.error("❌ Analytics fetch failed:", err);
        res.status(500).json({ message: 'Analytics fetch failed' });
    }
};
