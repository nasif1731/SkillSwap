import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    message: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    counterAmount: {
      type: Number,
      default: null,
    },
    countered: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
