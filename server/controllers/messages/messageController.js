import Message from '../../models/Message.js';
import crypto from 'crypto';
import Notification from '../../models/Notification.js';

// ─── Utility: Hash Metadata Securely ───────────────────────
const hashMetadata = (senderId, receiverId, content) => {
  const base = `${senderId}${receiverId}${content}${Date.now()}`;
  return crypto.createHash('sha256').update(base).digest('hex');
};

// ─── Send a Message ────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const metadata = hashMetadata(req.user._id, receiverId, content);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      metadata,
    });

    // ✅ CREATE A NOTIFICATION FOR THE RECEIVER
    await Notification.create({
      user: receiverId,
      type: 'message',
      message: `New message from ${req.user.name || 'someone'}`,
      link: `/dashboard/messages`, // adjust as needed
    });

    if (req.io) {
      req.io.to(receiverId.toString()).emit('receiveMessage', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Messages Between Two Users ────────────────────────
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('❌ Fetch conversation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Mark Message as Read ───────────────────────────────────
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark as read' });
    }

    message.readStatus = true;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('❌ Read status update error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// ─── Get All Conversations for Current User ─────────────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    const conversationMap = new Map();

    for (let msg of messages) {
      const isSender = msg.sender._id.toString() === userId.toString();
      const otherUser = isSender ? msg.receiver : msg.sender;

      // ⛔ Skip if sender and receiver are the same user
      if (otherUser._id.toString() === userId.toString()) continue;

      if (!conversationMap.has(otherUser._id.toString())) {
        conversationMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg.content,
          time: msg.createdAt,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('❌ Fetch conversations error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
