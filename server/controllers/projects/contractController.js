import Contract from '../../models/Contract.js';
import Project from '../../models/Project.js';
import crypto from 'crypto';

// ─── Hashing Function for Contract Terms ─────────────────
const hashTerms = (terms) => {
  return crypto.createHash('sha256').update(terms).digest('hex');
};

// ─── Create a Contract ──────────────────────────────────
// Create a Contract
export const createContract = async (req, res) => {
  try {
    const { projectId, freelancerId, terms } = req.body;

    if (!projectId || !freelancerId || !terms) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hash = hashTerms(terms);

    const contract = await Contract.create({
      project: projectId,
      client: req.user._id,
      freelancer: freelancerId,
      terms,
      hash,
      signatures: [],
      versions: [],
    });

    res.status(201).json({ success: true, contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// ─── Get Contract by Project ─────────────────────────────
export const getContractByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const contract = await Contract.findOne({ project: projectId });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.status(200).json({ success: true, contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Update Contract (New Version) ───────────────────────
export const updateContract = async (req, res) => {
  try {
    const { terms } = req.body;

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update contract' });
    }

    // Save old version
    contract.versions.push(contract.terms);

    contract.terms = terms;
    contract.hash = hashTerms(terms);

    await contract.save();

    res.status(200).json({ success: true, contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Sign Contract ──────────────────────────────────────
export const signContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    contract.signatures.push(req.user._id);
    await contract.save();

    res.status(200).json({ success: true, contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
