import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bid', 'message', 'system'], default: 'system' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
