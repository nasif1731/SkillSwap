// src/pages/MessagesPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');

      // 🟢 Fetch message notifications and mark them as read
      const notifRes = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unreadMessages = notifRes.data.notifications.filter(
        (n) => !n.isRead && n.type === 'message'
      );

      await Promise.all(
        unreadMessages.map((n) =>
          axios.put(`http://localhost:5000/api/notifications/${n._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      // 🟢 Then load conversations
      const res = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConversations(res.data.conversations || []);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) return <div className="p-6">Loading messages...</div>;

  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">📬 Your Conversations</h2>
      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv, index) => {
            const otherUser = conv.user;
            if (!otherUser) return null; // Skip invalid user

            return (
              <li
                key={index}
                className="bg-white p-4 shadow rounded hover:bg-blue-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {otherUser.name}
                    </h3>
                    <p className="text-sm text-gray-600">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400">{new Date(conv.time).toLocaleString()}</p>
                  </div>
                  <Link
                    to={`/dashboard/chat/${otherUser._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Chat →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MessagesPage;
