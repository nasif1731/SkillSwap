import Project from '../../models/Project.js';
import Bid from '../../models/Bid.js';
import asyncHandler from 'express-async-handler';

// ─── Create New Project ─────────────────────────────────────
export const createProject = async (req, res) => {
  try {
    const { title, description, requirements, deadline } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'Title, Description and Deadline are required' });
    }

    const project = await Project.create({
      title,
      description,
      requirements,
      deadline,
      client: req.user._id,
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get All Projects ───────────────────────────────────────
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('client', 'name email');
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Single Project By ID ─────────────────────────────────
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
  .populate('client', 'name email')
  .populate('freelancer', 'user');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Update Project ──────────────────────────────────────────
export const updateProject = async (req, res) => {
  try {
    const { title, description, requirements, deadline, status } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the client who posted the project can update it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this project' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.requirements = requirements || project.requirements;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;

    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Delete Project ──────────────────────────────────────────
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the client who posted the project can delete it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this project' });
    }

    await Project.deleteOne({ _id: project._id }); // ✅ Replaces .remove()

    res.status(200).json({ success: true, message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'name email', // Or any other fields you need
        },
      })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
      console.log("📥 Projects fetched with populated bids:", projects);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load client projects' });
  }
};

export const acceptBid = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { freelancerId, bidId } = req.body;

  console.log('📥 Accept Bid API Hit');
  console.log('➡️ Project ID:', projectId);
  console.log('➡️ Freelancer ID:', freelancerId);
  console.log('➡️ Bid ID:', bidId);

  if (!freelancerId || !bidId) {
    return res.status(400).json({ message: 'Missing freelancerId or bidId in body' });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // ✅ Update project
  project.freelancer = freelancerId;
  project.status = 'in-progress';
  await project.save();

  // ✅ Mark the selected bid as accepted
  const acceptedBid = await Bid.findByIdAndUpdate(
    bidId,
    { status: 'accepted' },
    { new: true }
  );

  // ✅ Optional: Reject all other bids for the same project
  await Bid.updateMany(
    { project: projectId, _id: { $ne: bidId } },
    { status: 'rejected' }
  );

  res.status(200).json({
    success: true,
    message: 'Bid accepted and project updated',
    project,
    acceptedBid,
  });
});

export const markComplete = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Ensure only the project owner (client) can mark it complete
  if (project.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You are not authorized to complete this project' });
  }

  project.status = 'completed';
  await project.save();

  res.status(200).json({ success: true, project });
});
import Freelancer from '../../models/Freelancer.js';

export const getFreelancerProjects = async (req, res) => {
  const freelancer = await Freelancer.findOne({ user: req.user._id });
  if (!freelancer) {
    console.log("❌ No freelancer profile for user:", req.user._id); // ✅
    return res.status(404).json({ message: 'Freelancer profile not found' });
  }

  console.log("✅ Found freelancer ID:", freelancer._id); // ✅


  const projects = await Project.find({ freelancer: freelancer._id })
    .populate('client', 'name email')
    .sort({ createdAt: -1 });

    console.log("📦 Fetched projects for freelancer:", projects.length); // ✅


  res.status(200).json({ success: true, projects });
};

export const updateProjectProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Only assigned freelancer can update
  const freelancer = await Freelancer.findOne({ user: req.user._id });
  if (!freelancer || project.freelancer.toString() !== freelancer._id.toString()) {
    return res.status(403).json({ message: 'Unauthorized to update this project' });
  }

  project.progress = progress;
  await project.save();

  res.status(200).json({ success: true, project });
});




