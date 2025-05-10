import { useEffect, useState } from 'react';
import axios from 'axios';

const FreelancerReviews = ({ freelancerId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${freelancerId}`);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating);
      setReviewCount(res.data.reviewCount);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    if (freelancerId) fetchReviews();
  }, [freelancerId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-2">⭐ Freelancer Reviews</h3>
      {reviewCount === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <>
          <p className="text-blue-600 mb-2">
            Average Rating: <span className="font-semibold">{averageRating} / 5</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">Total Reviews: {reviewCount}</p>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border p-3 rounded bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{review.client?.name || 'Anonymous'}</span>
                  <span className="text-yellow-500">★ {review.rating}</span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FreelancerReviews;
