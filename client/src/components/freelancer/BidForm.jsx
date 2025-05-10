import { useState } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BidForm = ({ projectId }) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !message) {
      return toast.error('All fields are required');
    }

    try {
      // ✅ Save bid to DB via API
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || "Failed to submit bid");
      }

      // ✅ Emit socket event
      socket.emit('placeBid', {
        projectId,
        amount,
        message,
        freelancer: data.bid.freelancer, // backend returns it
        bidId: data.bid._id,
        time: new Date().toISOString(),
      });

      toast.success('Bid submitted!');
      setAmount('');
      setMessage('');
    } catch (err) {
      console.error("Bid submission failed:", err);
      toast.error("Error submitting bid");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Bid Amount"
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        className="w-full p-2 border rounded"
        required
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Submit Bid
      </button>
    </form>
  );
};

export default BidForm;
