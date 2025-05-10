import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String },
    deadline: { type: Date },

    reminderSent: { type: Boolean, default: false }, // ✅ deadline tracking

    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },

    isHourly: { type: Boolean, default: false }, // ✅ hourly tracking

    hourLogs: [
      {
        date: { type: Date, default: Date.now },
        hours: { type: Number, required: true },
        description: { type: String },
      }
    ],

    milestones: [ // ✅ milestone tracking
      {
        title: { type: String, required: true },
        description: String,
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0 }, // optional
      }
    ],

    progress: {
      type: Number,
      default: 0,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      default: null,
    },
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
