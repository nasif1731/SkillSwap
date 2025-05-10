import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ChatPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersMap, setUsersMap] = useState({});
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/messages/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/messages/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rawMessages = res.data.messages || [];

      const unread = rawMessages.filter(
        (msg) => msg.receiver === currentUser._id && !msg.readStatus
      );
      await Promise.all(unread.map((msg) => markAsRead(msg._id)));

      const refreshed = await axios.get(
        `http://localhost:5000/api/messages/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(refreshed.data.messages || []);

      const ids = [
        ...new Set(
          refreshed.data.messages.flatMap((msg) => [msg.sender, msg.receiver])
        ),
      ];
      const usersRes = await axios.post(
        "http://localhost:5000/api/users/resolve-users",
        { ids },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userMap = {};
      usersRes.data.users.forEach((u) => {
        userMap[u._id] = u.name;
      });
      setUsersMap(userMap);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to load chat");
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/messages",
        { receiverId: userId, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      toast.error("Send failed");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">💬 Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded shadow">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender === currentUser._id;
            const senderName = usersMap[msg.sender] || "Unknown";

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                    {senderName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">
                    {isMine ? "You" : senderName}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg max-w-xs break-words ${
                    isMine ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.content}</p>

                  <div className="mt-1">
                    <p className="text-xs text-right opacity-80">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                    {isMine && (
                      <p
                        className={`text-xs text-right font-semibold ${
                          msg.readStatus ? "text-green-500" : "text-yellow-500"
                        }`}
                      >
                        {msg.readStatus ? "✔ Read" : "⏳ Pending"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded shadow-sm"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
