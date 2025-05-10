import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import BidForm from '../../components/freelancer/BidForm';
import BidList from '../../components/client/BidList';
import ReviewForm from '../../components/client/ReviewForm';

const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const [project, setProject] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const fetchReview = async (freelancerId) => {
    const reviewRes = await fetch(
      `http://localhost:5000/api/reviews/freelancer/${freelancerId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const reviewData = await reviewRes.json();
    const review = reviewData?.reviews?.find(
      (r) =>
        r.project === projectId &&
        (r.client === user.id || r.client?._id === user.id)
    );
    if (review) {
      setHasReviewed(true);
      setSubmittedReview(review);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('Invalid project response');
        }

        const data = await res.json();

        if (data.success && data.project) {
          setProject(data.project);
          const freelancerId = data.project.freelancer?._id || data.project.freelancer;
          if (freelancerId) {
            fetchReview(freelancerId);
          }
        } else {
          toast.error('❌ Project not found');
        }
      } catch (err) {
        console.error('Failed to fetch project', err);
        toast.error('❌ Server error while fetching project');
      }
    };

    fetchProject();
  }, [projectId, user.token, user.id]);

  const handleMarkComplete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/mark-complete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('Failed to mark project as completed');
      }

      const data = await res.json();
      toast.success('✅ Project marked as completed!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to mark project as completed');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Project Details</h1>

      {isFreelancer && (
        <div>
          <h2 className="text-xl font-semibold">Place Your Bid</h2>
          <BidForm projectId={projectId} freelancerId={user._id} />
        </div>
      )}

      <div className="mt-8">
        <BidList projectId={projectId} project={project} />
      </div>

      {isClient && project?.status === 'in-progress' && (
        <button
          onClick={handleMarkComplete}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ✅ Mark as Complete
        </button>
      )}

      {/* Review logic */}
      {project?.status === 'completed' && isClient && project?.freelancer && (
        <>
          {!hasReviewed ? (
            <div className="mt-10 p-4 border rounded bg-white shadow">
              <h2 className="text-xl font-semibold mb-2">Leave a Review</h2>
              <ReviewForm
                freelancerId={project.freelancer._id || project.freelancer}
                projectId={project._id}
                token={token}
                onSubmit={() => fetchReview(project.freelancer._id || project.freelancer)}
              />
            </div>
          ) : !editingReview && submittedReview && (
            <div className="mt-6 p-4 border bg-white rounded shadow">
              <h2 className="text-lg font-semibold text-green-700">✅ Your Review</h2>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color={i < submittedReview.rating ? '#ffc107' : '#e4e5e9'} />
                ))}
              </div>
              <p className="text-gray-700">{submittedReview.comment}</p>

              <div className="mt-3 flex gap-3">
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                  onClick={() => {
                    setEditingReview(true);
                    setEditRating(submittedReview.rating);
                    setEditComment(submittedReview.comment);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                  onClick={async () => {
                    const confirm = window.confirm('Delete your review?');
                    if (!confirm) return;
                    const res = await fetch(
                      `http://localhost:5000/api/reviews/${submittedReview._id}`,
                      {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    if (res.ok) {
                      setSubmittedReview(null);
                      setHasReviewed(false);
                      toast.success('Review deleted');
                    } else {
                      toast.error('Failed to delete review');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {editingReview && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch(
                  `http://localhost:5000/api/reviews/${submittedReview._id}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      rating: editRating,
                      comment: editComment,
                    }),
                  }
                );
                const data = await res.json();
                if (res.ok && data.success) {
                  setSubmittedReview(data.review);
                  setEditingReview(false);
                  toast.success('Review updated!');
                } else {
                  toast.error(data.message || 'Update failed');
                }
              }}
              className="mt-6 p-4 border bg-white rounded shadow"
            >
              <h2 className="text-lg font-semibold text-blue-700">✏️ Edit Your Review</h2>
              <div className="flex items-center my-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={i < editRating ? '#ffc107' : '#e4e5e9'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setEditRating(i + 1)}
                  />
                ))}
              </div>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded"
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-1 bg-gray-400 text-white rounded"
                  onClick={() => setEditingReview(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectDetailPage;
