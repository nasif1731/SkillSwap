import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';

const socket = io('http://localhost:5000');

const BidList = ({ projectId }) => {
  const [bids, setBids] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [counterInputs, setCounterInputs] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBids(res.data.bids || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    }
  };

  useEffect(() => {
    fetchBids();

    socket.on('newBid', (bid) => {
      if (bid.projectId === projectId) {
        setBids((prev) => [bid, ...prev]);
      }
    });

    return () => socket.off('newBid');
  }, [projectId]);

  const handleCounterChange = (bidId, value) => {
    setCounterInputs({ ...counterInputs, [bidId]: value });
  };

  const sendCounterOffer = async (bidId) => {
    const counterAmount = counterInputs[bidId];
    if (!counterAmount || isNaN(counterAmount) || Number(counterAmount) <= 0) {
      return toast.error('Enter a valid amount');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/projects/bid/${bidId}/counter`, {
        counterAmount: Number(counterAmount),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Counter offer sent!');
      fetchBids(); // Refresh the list
    } catch (err) {
      toast.error('Failed to send counter offer');
      console.error(err);
    }
  };

  const acceptBid = async (bidId, freelancerId) => {
    const token = localStorage.getItem('token');
    console.log('📤 Accepting Bid:', { projectId, bidId, freelancerId }); // ADD THIS
  
    try {
      const res = await axios.put(
        `http://localhost:5000/api/projects/accept-bid/${projectId}`,
        { bidId, freelancerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // ADD THIS
          },
        }
      );
  
      toast.success('Bid accepted. Project is now in progress!');
      fetchBids();
      window.location.reload();
    } catch (err) {
      console.error('❌ Accept Bid Error:', err.response?.data || err);
      toast.error('Failed to accept bid');
    }
  };
  

  const sortedFilteredBids = [...bids]
    .filter(bid => statusFilter === 'all' || bid.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'lowest') return a.amount - b.amount;
      if (sortBy === 'highest') return b.amount - a.amount;
      return 0;
    });

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="lowest">Lowest Amount</option>
          <option value="highest">Highest Amount</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {sortedFilteredBids.length === 0 ? (
        <p className="text-gray-500">No bids found.</p>
      ) : (
        <ul className="space-y-3">
          {sortedFilteredBids.map((bid) => (
            <li key={bid._id} className="border p-4 rounded shadow-sm">
              <p>💸 <strong>${bid.amount}</strong> — {bid.message}</p>
              <p className="text-sm text-gray-600">Status: <span className="font-semibold">{bid.status}</span></p>
              <p className="text-xs text-gray-400">{new Date(bid.createdAt).toLocaleString()}</p>

              {bid.countered && bid.counterAmount && (
                <p className="text-sm text-blue-600 mt-1">📤 Countered at: ${bid.counterAmount}</p>
              )}

              <div className="flex gap-2 mt-3 items-center">
                <input
                  type="number"
                  placeholder="Counter offer amount"
                  value={counterInputs[bid._id] || ''}
                  onChange={(e) => handleCounterChange(bid._id, e.target.value)}
                  className="border p-2 rounded w-40"
                />
                <button
                  onClick={() => sendCounterOffer(bid._id)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Send Counter
                </button>

                {/* ✅ Accept Bid Button - only for client */}
                {user?.role === 'client' && (
                  <button
                    onClick={() => acceptBid(bid._id, typeof bid.freelancer === 'object' ? bid.freelancer._id : bid.freelancer)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Accept Bid
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BidList;
