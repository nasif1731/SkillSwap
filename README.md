# 💼 SkillSwap – Freelance Marketplace Platform

SkillSwap is a secure, scalable, and real-time freelance marketplace platform designed to connect **freelancers** (developers, designers, writers) with **clients** in Pakistan’s growing digital economy. It addresses the lack of a localized freelance ecosystem by offering end-to-end service delivery, project management, in-app messaging, and analytics.

## 🚀 Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js, JWT, Bcrypt, Socket.io
- **Database:** MongoDB Atlas (Cloud), Mongoose
- **Authentication:** Role-Based (Client / Freelancer / Admin)
- **Security:** Password Hashing (Bcrypt), Document Hashing (SHA-256)
- **Real-Time:** WebSockets (Socket.io) for messaging and bidding
- **Deployment:** Vercel / Netlify (Frontend), Render / Heroku (Backend)

---

## 🔐 Core Features

### ✅ **Authentication & Authorization**
- Role-based access for Clients, Freelancers, and Admins
- JWT-based session management
- Passwords hashed with `bcrypt` (secure login flow)
- Email/phone verification flows

### 📢 **Client Features**
- Post, edit, delete projects with form validation
- Real-time bidding system with live updates and counter offers
- Freelancer search with filters (skills, ratings, category)
- In-app messaging and chat history with read receipts
- Review and rating system with filters

### 👨‍💻 **Freelancer Features**
- Create and update profile (skills, portfolio, status)
- Bid on projects and track bid status
- Manage multiple ongoing projects with progress tracking
- Project timeline and milestone updates

### 🧑‍⚖️ **Admin Features**
- Freelancer document verification with approval levels
- Platform-wide analytics and revenue tracking
- Admin dashboard for system metrics
- Notification system (email/SMS/in-app – mock with Twilio API)

### 📊 **Analytics Dashboard**
- Track freelancer performance and client engagement
- View real-time data visualizations via Chart.js
- Export reports in CSV/PDF format

---

## 🧠 Advanced Topics Implemented

- **Modular API Architecture** using Express Router
- **Secure Document & Metadata Hashing** (SHA-256)
- **WebSockets** for real-time communication & notifications
- **MongoDB Atlas Cloud Integration** with indexing, pooling, and replication
- **Scalable Contract System** with versioning and hash verification

---

## 🗂️ Folder Structure

SkillSwap/
├── client/ # React frontend
│ ├── components/
│ ├── pages/
│ └── services/
├── server/ # Express backend
│ ├── routes/
│ ├── controllers/
│ ├── middleware/
│ └── utils/
├── models/ # Mongoose schemas
├── sockets/ # Socket.io logic
├── .env # Environment variables
└── README.md
---


---

## 📦 API Endpoints Overview

### Authentication APIs
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `POST /api/auth/reset-password`

### Project APIs
- `GET /api/projects/`
- `POST /api/projects/`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/bids`
- `POST /api/projects/:id/milestones`

### Messaging & Notification APIs
- `POST /api/messages/`
- `POST /api/notify/email`
- `POST /api/notify/sms`
- `GET /api/notify/preferences`

---

## 📸 Demo

> 🔗 Live Demo: [Coming Soon]  
> 📽️ Walkthrough Video: [Coming Soon]  
> 🌐 Frontend: [Netlify/Vercel link]  
> ⚙️ Backend: [Render/Heroku link]

---

## 🧪 Run Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/skillswap.git
cd skillswap

# Start server
cd server
npm install
npm start

# Start client
cd client
npm install
npm start
```

