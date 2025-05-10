import { FaStar } from 'react-icons/fa';

const SubmittedReviewCard = ({ review }) => {
  if (!review) return null;

  return (
    <div className="p-4 border rounded bg-white shadow mt-6">
      <h2 className="text-xl font-semibold mb-2 text-green-700">✅ Your Submitted Review</h2>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            color={i < review.rating ? '#ffc107' : '#e4e5e9'}
            className="mr-1"
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({review.rating} stars)</span>
      </div>
      <p className="italic text-gray-800">"{review.comment}"</p>
      <p className="text-sm text-gray-500 mt-2">
        Submitted on {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default SubmittedReviewCard;
