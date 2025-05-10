import Bid from '../../models/Bid.js';
import Project from '../../models/Project.js';
import Freelancer from '../../models/Freelancer.js';

// ─── Place a Bid ───────────────────────────────────────
export const placeBid = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid bid amount is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Bidding is closed for this project' });
    }

    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    const bid = await Bid.create({
      freelancer: freelancer._id, // ✅ correct
      project: projectId,
      message,
      amount,
    });

    // 🟩 Important: Push bid into Project's bids array
    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { bids: bid._id },
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error('❌ Bid placement error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Update a Bid ──────────────────────────────────────
export const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { message, amount } = req.body;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const freelancer = await Freelancer.findOne({ user: req.user._id });

    if (!freelancer || bid.freelancer.toString() !== freelancer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this bid' });
    }

    bid.message = message || bid.message;
    bid.amount = amount || bid.amount;

    await bid.save();

    res.status(200).json({ success: true, bid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get All Bids for a Project ─────────────────────────
// Get All Bids for a Project
export const getBidsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const bids = await Bid.find({ project: projectId }).populate('freelancer', 'name');

    res.status(200).json({ success: true, bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// ─── Get Bids of a Freelancer ───────────────────────────
export const getMyBids = async (req, res) => {

  try {
    console.log('➡️ Authenticated User:', req.user);
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    const bids = await Bid.find({ freelancer: freelancer._id }).populate('project', 'title');

    res.status(200).json({ success: true, bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const counterOffer = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { counterAmount } = req.body;

    if (!counterAmount || counterAmount <= 0) {
      return res.status(400).json({ message: 'Invalid counter offer' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    // Only project owner (client) can send counter
    const project = await Project.findById(bid.project);
    if (!project || project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    bid.counterAmount = counterAmount;
    bid.countered = true;
    await bid.save();

    // Optional: Notify freelancer via Socket.io
    if (global.io) {
      global.io.emit(`bid:${bid._id}:countered`, {
        bidId: bid._id,
        counterAmount,
      });
    }

    res.status(200).json({ success: true, message: 'Counter offer sent', bid });
  } catch (error) {
    console.error('Counter offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBidAnalytics = async (req, res) => {
  try {
    const bids = await Bid.find();

    const totalBids = bids.length;
    const avgBidPrice = totalBids ? (bids.reduce((sum, b) => sum + b.amount, 0) / totalBids).toFixed(2) : 0;
    const highestBid = bids.length ? Math.max(...bids.map(b => b.amount)) : 0;
    const lowestBid = bids.length ? Math.min(...bids.map(b => b.amount)) : 0;

    const statusCounts = bids.reduce((acc, bid) => {
      acc[bid.status] = (acc[bid.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      totalBids,
      averageBidPrice: Number(avgBidPrice),
      highestBid,
      lowestBid,
      statusCounts
    });
  } catch (err) {
    console.error('Bid analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getFreelancerBidAnalytics = async (req, res) => {
  try {
    // 🔍 Find freelancer using the logged-in user ID
    const freelancer = await Freelancer.findOne({ user: req.user._id });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    const bids = await Bid.find({ freelancer: freelancer._id });

    const totalBids = bids.length;
    const avgBidPrice = totalBids ? (bids.reduce((sum, b) => sum + b.amount, 0) / totalBids).toFixed(2) : 0;
    const highestBid = bids.length ? Math.max(...bids.map(b => b.amount)) : 0;
    const lowestBid = bids.length ? Math.min(...bids.map(b => b.amount)) : 0;

    const statusCounts = bids.reduce((acc, bid) => {
      acc[bid.status] = (acc[bid.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      totalBids,
      averageBidPrice: Number(avgBidPrice),
      highestBid,
      lowestBid,
      statusCounts
    });
  } catch (err) {
    console.error("Freelancer analytics error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

