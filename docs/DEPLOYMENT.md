# OPNTUS Deployment Guide

This guide covers deploying OPNTUS to:
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

---

## 1. MongoDB Atlas Setup

### Create Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account → **Create a New Project** → name it `opntus`
3. Build a Database → choose **M0 Free** tier → select your region
4. Create a username and password → **Save credentials**

### Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. For development: Add `0.0.0.0/0` (allow all)
3. For production: Add only your Render backend's IP

### Get Connection String
1. Go to **Database** → **Connect** → **Connect your application**
2. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with your credentials
4. Add your database name: `...mongodb.net/opntus?retryWrites=...`

---

## 2. Backend Deployment (Render)

### Prepare Backend
1. Push your `backend/` folder to a GitHub repository
2. Make sure `package.json` has a valid `build` and `start` script:
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node dist/server.js"
   }
   ```

### Deploy on Render
1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `opntus-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for production)

### Set Environment Variables on Render
Go to your service → **Environment** → add these:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-opntus.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/opntus?retryWrites=true&w=majority
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
IP_SALT=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ADMIN_REGISTRATION_KEY=<your-secret-admin-key>
```

4. Click **Create Web Service**
5. Note your backend URL: `https://opntus-backend.onrender.com`

---

## 3. Frontend Deployment (Vercel)

### Prepare Frontend
1. Push your `frontend/` folder to a GitHub repository (can be same repo)

### Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `frontend` (if monorepo)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Set Environment Variables on Vercel
Go to **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://opntus-backend.onrender.com/api
NEXT_PUBLIC_WS_URL=https://opntus-backend.onrender.com
NEXT_PUBLIC_APP_NAME=OPNTUS
```

4. Click **Deploy**
5. Note your frontend URL: `https://your-opntus.vercel.app`

### Update Backend CORS
Go back to Render → update `FRONTEND_URL` with your actual Vercel URL.

---

## 4. Create First Admin Account

Once deployed, create your first listener/admin via the API:

```bash
curl -X POST https://opntus-backend.onrender.com/api/auth/listener/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@yourdomain.com",
    "password": "strongpassword123",
    "adminKey": "your-ADMIN_REGISTRATION_KEY"
  }'
```

Then promote to admin directly in MongoDB Atlas:
1. Atlas → Browse Collections → `listeners` collection
2. Find your listener document → Edit
3. Change `"role": "listener"` → `"role": "admin"`

---

## 5. Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Backend health check passes: `GET https://your-backend.onrender.com/api/health`
- [ ] Frontend loads at Vercel URL
- [ ] Listener can login at `/listener/login`
- [ ] Admin dashboard loads at `/admin`
- [ ] Anonymous user can start a session and join queue
- [ ] Socket.IO connection works (check browser console)
- [ ] Rate limiting is active
- [ ] CORS only allows your Vercel domain

---

## 6. MongoDB Indexes (Auto-created by Mongoose)

The following indexes are created automatically by the models:

```
users:     sessionId (unique), isBanned, createdAt (TTL 90d)
listeners: email (unique), status
sessions:  userId, listenerId, status, isFlagged, createdAt (TTL 30d)
messages:  sessionId, timestamp (TTL 30d)
reports:   sessionId, status, timestamp
```

---

## 7. Custom Domain (Optional)

### Vercel
Settings → Domains → Add your domain → Follow DNS instructions

### Render
Settings → Custom Domains → Add domain → Update DNS

---

## 8. Monitoring

### Render
- Built-in logs under **Logs** tab
- Set up health check: `GET /api/health`

### MongoDB Atlas
- Monitor → Metrics for database performance
- Set up alerts for connection issues

### Vercel
- Analytics tab for frontend performance
- Function logs for API routes (if using Next.js API routes)

---

## Environment Variables Reference

### Backend (.env)

| Variable                | Required | Description                                      |
|-------------------------|----------|--------------------------------------------------|
| `NODE_ENV`              | Yes      | `production` or `development`                   |
| `PORT`                  | Yes      | Server port (Render uses 10000)                 |
| `FRONTEND_URL`          | Yes      | Your Vercel frontend URL (for CORS)             |
| `MONGODB_URI`           | Yes      | MongoDB Atlas connection string                  |
| `JWT_SECRET`            | Yes      | 64-char random hex string                       |
| `JWT_EXPIRES_IN`        | Yes      | Token expiry e.g. `7d`                          |
| `IP_SALT`               | Yes      | 32-char random hex for IP hashing               |
| `ADMIN_REGISTRATION_KEY`| Yes      | Secret key to create listener accounts          |

### Frontend (.env.local)

| Variable                    | Required | Description                    |
|-----------------------------|----------|--------------------------------|
| `NEXT_PUBLIC_API_URL`       | Yes      | Backend API base URL           |
| `NEXT_PUBLIC_WS_URL`        | Yes      | Backend WebSocket URL          |
| `NEXT_PUBLIC_APP_NAME`      | No       | App display name               |
