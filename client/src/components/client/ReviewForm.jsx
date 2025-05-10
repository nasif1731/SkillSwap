import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewForm = ({ freelancerId, projectId, token, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please select a rating');
    if (!comment.trim()) return setError('Comment is required');

    try {
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ freelancerId, projectId, rating, comment }),
      });

      if (!res.ok) throw new Error('Error submitting review');

      setComment('');
      setRating(0);
      setError('');
      if (onSubmit) onSubmit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 border rounded-lg shadow-md"
    >
      <h4 className="text-xl font-semibold text-gray-800">Leave a Review</h4>

      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => {
          const value = i + 1;
          return (
            <FaStar
              key={i}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer text-2xl transition-transform hover:scale-125"
              color={value <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
            />
          );
        })}
        <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
      </div>

      <textarea
        rows="4"
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
      />

      {error && (
        <p className="text-sm text-red-600 font-medium -mt-2">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-all duration-200"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
