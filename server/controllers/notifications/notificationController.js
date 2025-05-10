import Notification from '../../models/Notification.js';

// ─── Send Notification ─────────────────────────────────
export const sendNotification = async (req, res) => {
  try {
    const { userId, type, message, link } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and Message are required' });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      message,
      link,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get User Notifications ────────────────────────────
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Mark Notification as Read ─────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Make sure it's the owner's notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
