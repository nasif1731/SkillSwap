import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
    terms: {
      type: String,
      required: true,
    },
    signatures: {
      type: [String], // base64 or URLs
    },
    hash: {
      type: String, // SHA-256 hashed contract
    },
    versions: [{
      type: String, // previous versions
    }],
  },
  { timestamps: true }
);

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
