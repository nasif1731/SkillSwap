import mongoose from 'mongoose';

const freelancerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    skills: {
      type: [String],
      default: []
    },
    expertise: {
      type: String,
      default: ''
    },
    experience: {
      type: String,
      default: ''
    },
    verificationLevel: {
      type: String,
      enum: ['Basic', 'Verified', 'Premium'],
      default: 'Basic',
    },
    portfolio: {
      type: String,
      default: ''
    },
    verified: {
      type: Boolean,
      default: false
    },

    // ✅ Rating Fields
    averageRating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Freelancer', freelancerSchema);
