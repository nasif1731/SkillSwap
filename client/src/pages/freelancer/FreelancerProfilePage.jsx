import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import EditProfileSection from "./EditProfileSection";

const FreelancerProfilePage = () => {
  const { freelancerId: routeParamId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const freelancerId =
    routeParamId || (user?.role === "freelancer" ? user._id : null);

  const [freelancer, setFreelancer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [completeness, setCompleteness] = useState(0);

  const calculateCompleteness = (data) => {
    let total = 4;
    let filled = 0;
    if (data.skills && data.skills.length > 0) filled++;
    if (data.experience) filled++;
    if (data.expertise) filled++;
    if (data.portfolio) filled++;
    return Math.round((filled / total) * 100);
  };

  const fetchFreelancer = async () => {
    try {
      const url =
        user?.role === "freelancer" && !routeParamId
          ? "http://localhost:5000/api/freelancers/me"
          : `http://localhost:5000/api/freelancers/${freelancerId}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed with status ${res.status}`);

      const data = await res.json();
      setFreelancer(data);
      setCompleteness(calculateCompleteness(data));
    } catch (err) {
      console.error("❌ Failed to fetch freelancer profile:", err.message);
      toast.error("Freelancer profile not found or unavailable.");
      setFreelancer(false);
    }
  };

  const fetchReviews = async () => {
    if (!freelancer?._id) return;
    try {
      const query = `?rating=${ratingFilter}&sort=${sortOrder}`;
      const res = await fetch(
        `http://localhost:5000/api/reviews/freelancer/${freelancer._id}${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
    } catch (err) {
      toast.error("Failed to load reviews.");
    }
  };

  useEffect(() => {
    fetchFreelancer();
  }, [routeParamId]);

  useEffect(() => {
    if (freelancer?._id) fetchReviews();
  }, [freelancer, ratingFilter, sortOrder]);

  const handleResponseSubmit = async (reviewId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/${reviewId}/respond`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response: responseText }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Response submitted!");
        setRespondingTo(null);
        setResponseText("");
        fetchReviews();
      }
    } catch (err) {
      toast.error("Failed to submit response.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <a href="/search" className="text-blue-600 underline mb-4 inline-block">
        ← Back to Search
      </a>

      {freelancer ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-1">
              {freelancer.user.name}
            </h1>
            <p className="text-gray-700">{freelancer.expertise}</p>

            <div className="flex items-center mt-2 gap-1 text-lg">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  color={i < Math.round(averageRating) ? "#ffc107" : "#e4e5e9"}
                />
              ))}
              <span className="ml-2 text-gray-700">
                {Number(averageRating || 0).toFixed(1)} / 5
              </span>
              {averageRating >= 4.5 && (
                <span className="ml-3 text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  🌟 Top Rated
                </span>
              )}
            </div>

            {user?.role === "freelancer" &&
              (user._id || user.id) ===
                (freelancer.user?._id || freelancer.user) && (
                <p className="text-sm text-gray-500 mt-2">
                  Profile completeness:{" "}
                  <span className="font-semibold">{completeness}%</span>
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Skills
              </h2>
              <ul className="list-disc list-inside text-gray-700 text-sm">
                {freelancer.skills.length > 0 ? (
                  freelancer.skills.map((skill, i) => <li key={i}>{skill}</li>)
                ) : (
                  <li>No skills listed</li>
                )}
              </ul>
            </div>
            <div>
              <p>
                <strong>Expertise:</strong> {freelancer.expertise}
              </p>
              <p>
                <strong>Experience:</strong> {freelancer.experience} years
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {freelancer.verified ? "✅ Verified" : "⏳ Pending"}
              </p>
            </div>
          </div>

          {user?.role === "freelancer" &&
            (user._id || user.id) ===
              (freelancer.user?._id || freelancer.user) && (
              <>
                <div className="mt-6 mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    ✏️ Manage Your Profile
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    Update your skills, expertise, experience and portfolio.
                  </p>
                </div>
                <EditProfileSection
                  freelancer={freelancer}
                  token={token}
                  onUpdate={fetchFreelancer}
                />
              </>
            )}

          {/* Review Filters */}
          <div className="flex gap-4 mb-4">
            <select
              className="border p-2 rounded"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 && "s"}
                </option>
              ))}
            </select>

            <select
              className="border p-2 rounded"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Reviews */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Client Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="border rounded p-4 mb-4 bg-white shadow-sm"
              >
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  — {review.client?.name || "Anonymous"}
                </p>

                {review.response && (
                  <div className="mt-2 border-l-4 border-blue-500 pl-3 italic text-sm text-gray-800">
                    <strong>Freelancer response:</strong> {review.response}
                  </div>
                )}

                {!review.response &&
                  user?.role === "freelancer" &&
                  (user._id || user.id) ===
                    (freelancer.user?._id || freelancer.user) && (
                    <div className="mt-2">
                      {respondingTo === review._id ? (
                        <>
                          <textarea
                            rows="2"
                            className="w-full border p-2 text-sm"
                            placeholder="Write your response..."
                            value={responseText}
                            onChange={(e) =>
                              setResponseText(e.target.value)
                            }
                          />
                          <button
                            className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded"
                            onClick={() => handleResponseSubmit(review._id)}
                          >
                            Submit Response
                          </button>
                        </>
                      ) : (
                        <button
                          className="mt-2 px-3 py-1 bg-gray-200 text-sm rounded"
                          onClick={() => setRespondingTo(review._id)}
                        >
                          Reply to Review
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))
          )}
        </>
      ) : (
        <p>Loading freelancer profile...</p>
      )}
    </div>
  );
};

export default FreelancerProfilePage;
