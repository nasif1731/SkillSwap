import { useEffect, useState } from 'react';

const VerifyFreelancersPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [levels, setLevels] = useState({}); // Track selected level for each freelancer

  useEffect(() => {
    const fetchFreelancers = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/pending-freelancers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFreelancers(data.freelancers);
    };
    fetchFreelancers();
  }, []);

  const handleVerification = async (id, status) => {
    const token = localStorage.getItem('token');
    const level = levels[id] || 'Basic'; // Default to Basic if not selected
    const res = await fetch(`http://localhost:5000/api/admin/verify-freelancer/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, level }),
    });

    if (res.ok) {
      setFreelancers((prev) => prev.filter((f) => f._id !== id));
    } else {
      alert("Failed to update verification status.");
    }
  };

  const handleLevelChange = (freelancerId, value) => {
    setLevels((prev) => ({ ...prev, [freelancerId]: value }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛂 Verify Freelancers</h1>
      {freelancers.length === 0 ? (
        <p>No pending freelancers.</p>
      ) : (
        freelancers.map((freelancer) => (
          <div key={freelancer._id} className="bg-white p-4 mb-4 shadow rounded">
            <h2 className="text-xl">{freelancer.user.name}</h2>
            <p>Email: {freelancer.user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor={`level-${freelancer._id}`} className="text-sm">
                Level:
              </label>
              <select
                id={`level-${freelancer._id}`}
                value={levels[freelancer._id] || 'Basic'}
                onChange={(e) => handleLevelChange(freelancer._id, e.target.value)}
                className="border p-1 rounded"
              >
                <option value="Basic">Basic</option>
                <option value="Verified">Verified</option>
                <option value="Premium">Premium</option>
              </select>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleVerification(freelancer._id, 'verified')}
              >
                Approve
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleVerification(freelancer._id, 'rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VerifyFreelancersPage;
