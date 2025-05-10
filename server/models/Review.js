import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  response: { type: String, default: '' }, 
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
