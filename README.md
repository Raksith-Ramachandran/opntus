# OPNTUS — Open To Us

> A modern, secure, anonymous emotional-support platform where users connect with trained listeners without revealing personal identity.

![OPNTUS](https://img.shields.io/badge/OPNTUS-v1.0.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socket.io)

---

## What is OPNTUS?

OPNTUS ("Open To Us") is a peer emotional support platform. Users can talk anonymously to trained volunteer listeners without creating an account or revealing any personal information.

**OPNTUS is NOT a therapy platform.** It does not provide medical, psychiatric, or emergency services.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express.js, Socket.IO      |
| Database   | MongoDB (Atlas)                     |
| Auth       | JWT (listeners/admins only)         |
| Realtime   | Socket.IO WebSockets                |
| Frontend Deploy | Vercel                        |
| Backend Deploy  | Render                        |
| DB Deploy       | MongoDB Atlas                 |

---

## Project Structure

```
opntus/
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Public landing page
│   │   │   ├── layout.tsx       # Root layout + fonts
│   │   │   ├── globals.css      # Tailwind + design tokens
│   │   │   ├── chat/            # Real-time chat UI
│   │   │   ├── post-session/    # Post-session feedback
│   │   │   ├── dashboard/       # Listener dashboard
│   │   │   ├── admin/           # Admin panel
│   │   │   └── listener/
│   │   │       ├── login/       # Listener login
│   │   │       └── register/    # Listener registration
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── socket.ts        # Socket.IO client singleton
│   │   └── types/
│   │       └── index.ts         # Shared TypeScript types
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/                     # Express + Socket.IO API
│   ├── src/
│   │   ├── server.ts            # Entry point
│   │   ├── socket/
│   │   │   └── index.ts         # Socket.IO engine
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Listener.ts
│   │   │   ├── Session.ts
│   │   │   ├── Message.ts
│   │   │   └── Report.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── sessions.ts
│   │   │   ├── listeners.ts
│   │   │   └── admin.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── nameGenerator.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── docs/
    ├── API.md                   # Full API documentation
    ├── DEPLOYMENT.md            # Deployment guide
    └── SOCKET_EVENTS.md         # Socket.IO events reference
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables

```bash
# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with your values

# Backend
cd ../backend
cp .env.example .env
# Edit .env with your values
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Runs on http://localhost:3000
```

---

## User Flows

### Anonymous User
1. Visit landing page → click **Talk Now**
2. Choose mood (Stressed, Lonely, Anxious, etc.)
3. Choose communication type (Text — Voice/Video coming soon)
4. Join queue → get assigned anonymous identity (e.g. `CalmRiver42`)
5. Connect with listener in private encrypted chat
6. End session → submit optional feedback

### Listener
1. Login at `/listener/login`
2. Set status to **Online**
3. Accept users from the waiting queue
4. Chat in real-time, end session when complete
5. View session history and ratings on dashboard

### Admin
1. Login with admin credentials at `/listener/login`
2. View platform metrics at `/admin`
3. Manage listeners (add, suspend, remove)
4. Review and resolve abuse reports
5. Ban users if necessary

---

## Security Features

- ✅ Rate limiting (global + auth-specific)
- ✅ JWT authentication for listeners/admins
- ✅ Helmet.js security headers
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ Input validation (express-validator)
- ✅ XSS protection (input sanitization)
- ✅ IP hashing (SHA-256 with salt — never stores raw IPs)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Auto-deletion of user data (90 days) and sessions/messages (30 days)
- ✅ CORS restricted to frontend origin
- ✅ Socket.IO authenticated connections

---

## Privacy Design

OPNTUS is built privacy-first:
- Users never provide name, email, phone, or social media
- Anonymous identities are auto-generated (`CalmRiver42`)
- Session IDs are cryptographically random (32 bytes)
- IP addresses are hashed (SHA-256 + salt), never stored raw
- Messages auto-delete after 30 days
- User records auto-delete after 90 days
- No analytics on user conversations

---

## Future Features (Architecture Ready)

- 🎙 Voice calling
- 📹 Video calling
- 🤖 AI-assisted moderation
- 💡 AI conversation suggestions
- 🌍 Multi-language support
- 📱 Mobile app (React Native)
- 🔔 Push notifications

---

## Safety Notice

OPNTUS provides peer emotional support and is **not** a substitute for professional medical, psychiatric, or emergency services. If you or someone you know is in immediate danger, please contact your local emergency services or a crisis helpline.

---

## License

MIT © OPNTUS
