import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import cron from 'node-cron';
import { checkProjectDeadlines } from './controllers/cron/deadlineReminder.js';


import authRoutes from './routes/auth/authRoutes.js';
import projectRoutes from './routes/projects/projectRoutes.js';
import bidRoutes from './routes/projects/bidRoutes.js';
import notificationRoutes from './routes/notifications/notificationRoutes.js';
import messageRoutes from './routes/messages/messageRoutes.js';
import reviewRoutes from './routes/reviews/reviewRoutes.js';
import contractRoutes from './routes/projects/contractRoutes.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import userRoutes from './routes/user/userRoutes.js';
import freelancerRoutes from './routes/freelancer/freelancerRoutes.js';
import clientAnalyticsRoutes from './routes/analytics/clientAnalyticsRoutes.js';

dotenv.config();

// ─── Connect to MongoDB Atlas ───────────────────────────
connectDB();

cron.schedule('* * * * *', async () => {
  console.log('🔄 Running project deadline reminder check...');
  await checkProjectDeadlines();
});


const app = express();
const httpServer = createServer(app);

// ─── Setup Socket.io ─────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for now (you can restrict later)
    methods: ['GET', 'POST'],
  },
});

// ─── Socket.io Events ───────────────────────────────────
io.on('connection', (socket) => {
  console.log('⚡ New WebSocket connection');

  socket.on('placeBid', (data) => {
    console.log('New Bid Placed:', data);

    // Broadcast to all other connected clients
    socket.broadcast.emit('newBid', data);
  });

  socket.on('sendMessage', (data) => {
    console.log('New Message:', data);

    // Broadcast to all other connected clients
    socket.broadcast.emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('⚡ Client disconnected');
  });
});

// ─── Middlewares ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', bidRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/analytics', clientAnalyticsRoutes);

// ─── Default Route ──────────────────────────────────────
app.get('/', (req, res) => {
  res.send('SkillSwap API is running 🚀');
});

// ─── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
