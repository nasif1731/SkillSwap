import mongoose from 'mongoose';
import crypto from 'crypto';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: String, // SHA-256 hash of metadata
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate hashed metadata before saving
messageSchema.pre('save', function (next) {
  const base = `${this.sender}${this.receiver}${this.content}${this.createdAt || Date.now()}`;
  this.metadata = crypto.createHash('sha256').update(base).digest('hex');
  next();
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
