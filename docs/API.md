# OPNTUS API Documentation

Base URL: `https://your-backend.onrender.com/api`

All responses are JSON. Authenticated routes require `Authorization: Bearer <token>` header.

---

## Health Check

### GET /health
Check server status.

**Response**
```json
{ "status": "ok", "ts": "2024-01-01T00:00:00.000Z" }
```

---

## Auth

### POST /auth/user/start
Start an anonymous user session. No authentication required.

**Request Body**
```json
{
  "mood": "anxious"
}
```

**Mood values:** `stressed` | `lonely` | `anxious` | `overthinking` | `relationship` | `academic` | `work` | `general`

**Response 201**
```json
{
  "sessionId": "a3f8c2d1e9b4...",
  "anonymousName": "CalmRiver42",
  "mood": "anxious",
  "userId": "64a1b2c3d4e5f6789abc1234"
}
```

---

### POST /auth/listener/login
Authenticate a listener or admin.

**Request Body**
```json
{
  "email": "listener@opntus.com",
  "password": "securepassword"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "listener": {
    "id": "64a1b2c3d4e5f6789abc1234",
    "name": "Priya M.",
    "email": "listener@opntus.com",
    "role": "listener",
    "status": "offline"
  }
}
```

**Error 401**
```json
{ "error": "Invalid credentials" }
```

---

### POST /auth/listener/register
Create a listener account. Requires admin key.

**Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@opntus.com",
  "password": "securepassword123",
  "adminKey": "your-admin-registration-key"
}
```

**Response 201**
```json
{
  "message": "Listener account created",
  "listener": {
    "id": "64a1b2c3d4e5f6789abc1234",
    "name": "Jane Doe",
    "email": "jane@opntus.com",
    "role": "listener"
  }
}
```

---

## Sessions

### GET /sessions/:id
Get session details. Requires listener auth.

**Headers:** `Authorization: Bearer <token>`

**Response 200**
```json
{
  "session": {
    "_id": "64a1b2c3d4e5f6789abc1234",
    "userId": "...",
    "listenerId": { "name": "Priya M.", "email": "priya@opntus.com" },
    "mood": "anxious",
    "status": "active",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "communicationType": "text"
  }
}
```

---

### GET /sessions/:id/messages
Get all messages for a session. Requires listener auth.

**Response 200**
```json
{
  "messages": [
    {
      "_id": "...",
      "sessionId": "...",
      "senderType": "listener",
      "message": "Hi there. I'm here and I'm listening.",
      "timestamp": "2024-01-01T10:00:01.000Z"
    },
    {
      "_id": "...",
      "sessionId": "...",
      "senderType": "user",
      "message": "I've been feeling really overwhelmed lately.",
      "timestamp": "2024-01-01T10:00:45.000Z"
    }
  ]
}
```

---

### POST /sessions/:id/feedback
Submit post-session feedback. No auth required (user submits by sessionId).

**Request Body**
```json
{
  "rating": 5,
  "helpful": true,
  "feedback": "My listener was very patient and understanding."
}
```

All fields are optional.

**Response 200**
```json
{ "message": "Feedback submitted", "session": { ... } }
```

---

### POST /sessions/:id/report
Report a session for abuse/issues.

**Request Body**
```json
{
  "reason": "harassment",
  "reporterType": "user",
  "description": "The listener said something inappropriate."
}
```

**Reason values:** `harassment` | `inappropriate_content` | `spam` | `impersonation` | `technical_issue` | `other`

**Response 201**
```json
{ "message": "Report submitted", "reportId": "64a1b2c3d4e5f6789abc5678" }
```

---

## Listeners (Authenticated)

All routes require `Authorization: Bearer <token>`.

### GET /listeners/me
Get current listener profile.

**Response 200**
```json
{
  "listener": {
    "_id": "...",
    "name": "Priya M.",
    "email": "priya@opntus.com",
    "role": "listener",
    "status": "online",
    "totalSessions": 142,
    "averageRating": 4.9,
    "totalRatings": 138
  }
}
```

---

### PATCH /listeners/me/status
Update listener online status.

**Request Body**
```json
{ "status": "online" }
```

**Status values:** `online` | `offline` | `busy`

**Response 200**
```json
{ "status": "online" }
```

---

### GET /listeners/me/sessions
Get current listener's session history.

**Query Params:** `page` (default: 1), `limit` (default: 20)

**Response 200**
```json
{
  "sessions": [ { ... }, { ... } ],
  "total": 142,
  "page": 1
}
```

---

## Admin (Admin Role Required)

All routes require `Authorization: Bearer <admin-token>`.

### GET /admin/metrics
Get platform overview metrics.

**Response 200**
```json
{
  "totalUsers": 2847,
  "activeListeners": 18,
  "activeSessions": 31,
  "completedToday": 204,
  "pendingReports": 3
}
```

---

### GET /admin/listeners
Get all listener accounts.

**Response 200**
```json
{
  "listeners": [
    {
      "_id": "...",
      "name": "Priya M.",
      "email": "priya@opntus.com",
      "role": "listener",
      "status": "online",
      "totalSessions": 142,
      "averageRating": 4.9,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH /admin/listeners/:id/status
Update a listener's status (e.g. suspend them).

**Request Body**
```json
{ "status": "suspended" }
```

**Status values:** `online` | `offline` | `suspended`

---

### DELETE /admin/listeners/:id
Permanently remove a listener account.

**Response 200**
```json
{ "message": "Listener removed" }
```

---

### GET /admin/reports
Get abuse reports.

**Query Params:** `status` (default: `pending`), `page`, `limit`

**Status values:** `pending` | `reviewed` | `resolved` | `dismissed`

**Response 200**
```json
{
  "reports": [
    {
      "_id": "...",
      "sessionId": { ... },
      "reporterType": "user",
      "reason": "harassment",
      "description": "...",
      "status": "pending",
      "timestamp": "2024-01-01T10:30:00.000Z"
    }
  ],
  "total": 3,
  "page": 1
}
```

---

### PATCH /admin/reports/:id
Update a report's status after review.

**Request Body**
```json
{
  "status": "resolved",
  "actionTaken": "Listener warned and session flagged."
}
```

---

### POST /admin/users/:sessionId/ban
Ban a user by their sessionId.

**Request Body**
```json
{ "reason": "Repeated harassment of listeners." }
```

**Response 200**
```json
{ "message": "User banned", "userId": "..." }
```

---

## Error Responses

All errors follow this format:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Validation error               |
| 401    | Not authenticated              |
| 403    | Forbidden (wrong role)         |
| 404    | Resource not found             |
| 409    | Conflict (e.g. email exists)   |
| 429    | Rate limit exceeded            |
| 500    | Internal server error          |

---

## Rate Limits

| Endpoint Group   | Limit            |
|------------------|------------------|
| All `/api/` routes | 100 req / 15 min |
| `/api/auth/` routes | 10 req / 1 hour  |
