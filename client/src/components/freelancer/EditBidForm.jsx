import { useState } from "react";

const EditBidForm = ({ bid, onDone }) => {
  const [amount, setAmount] = useState(bid.amount);
  const [message, setMessage] = useState(bid.message);
  const token = localStorage.getItem("token");

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/projects/bid/${bid._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, message }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Bid updated successfully!");
        onDone?.();
      } else {
        alert(data.message || "Failed to update bid.");
      }
    } catch (err) {
      console.error("Edit bid error:", err);
    }
  };

  return (
    <form onSubmit={handleEdit} className="p-4 bg-yellow-50 shadow rounded mb-3">
      <h3 className="text-lg font-semibold mb-2">Edit Bid</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-2"
        required
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 w-full mb-2"
        rows={3}
        required
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
        Update
      </button>
    </form>
  );
};

export default EditBidForm;
