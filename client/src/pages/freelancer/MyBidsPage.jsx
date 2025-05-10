import { useEffect, useState } from 'react';
import EditBidForm from '../../components/freelancer/EditBidForm'; // adjust path

const MyBidsPage = () => {
  const [bids, setBids] = useState([]);
  const [editingBidId, setEditingBidId] = useState(null);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/projects/freelancer/my-bids', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const html = await res.text();
        throw new Error(`Expected JSON but got: ${html.slice(0, 100)}...`);
      }

      const data = await res.json();
      setBids(data.bids || []);
    } catch (err) {
      console.error("Failed to fetch bids:", err);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Bids</h2>
      {bids.length === 0 ? <p>No bids placed yet.</p> : (
        bids.map((bid) => (
          <div key={bid._id} className="border p-3 mb-3 bg-white shadow rounded">
            <h3 className="font-semibold">{bid.project?.title || 'Unnamed Project'}</h3>
            <p>Amount: ${bid.amount}</p>
            <p>Status: {bid.status}</p>
            {bid.countered && (
              <p className="text-yellow-500">Counter Offer: ${bid.counterAmount}</p>
            )}
            {editingBidId === bid._id ? (
              <EditBidForm bid={bid} onDone={() => {
                setEditingBidId(null);
                fetchBids();
              }} />
            ) : (
              bid.status === 'pending' && (
                <button
                  onClick={() => setEditingBidId(bid._id)}
                  className="text-blue-600 underline mt-2"
                >
                  Edit
                </button>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyBidsPage;
