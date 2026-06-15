# OPNTUS Socket.IO Events Reference

Connection URL: `ws://your-backend.onrender.com`

---

## Connection

### Auth — Anonymous User
```js
const socket = io("https://your-backend.onrender.com", {
  auth: { sessionId: "a3f8c2d1e9b4..." }  // from POST /auth/user/start
});
```

### Auth — Listener / Admin
```js
const socket = io("https://your-backend.onrender.com", {
  auth: { token: "eyJhbGci..." }  // JWT from POST /auth/listener/login
});
```

---

## Client → Server Events

### `join:queue`
User joins the waiting queue.

```js
socket.emit("join:queue", { mood: "anxious" });
```

---

### `leave:queue`
User leaves the waiting queue (e.g. navigates away).

```js
socket.emit("leave:queue");
```

---

### `listener:accept`
Listener accepts a user from the queue.

```js
socket.emit("listener:accept", { userId: "a3f8c2d1e9b4..." });
```

---

### `chat:message`
Send a chat message inside an active session.

```js
socket.emit("chat:message", {
  roomId: "session_1719000000_abc123",
  sessionId: "64a1b2c3d4e5f6789abc1234",
  message: "Hello, I've been feeling really overwhelmed."
});
```

---

### `chat:typing`
Broadcast typing indicator to the other party.

```js
// User is typing
socket.emit("chat:typing", { roomId: "session_...", isTyping: true });

// User stopped typing
socket.emit("chat:typing", { roomId: "session_...", isTyping: false });
```

---

### `session:end`
End the active session.

```js
socket.emit("session:end", {
  roomId: "session_1719000000_abc123",
  sessionId: "64a1b2c3d4e5f6789abc1234"
});
```

---

### `session:report`
Report a session for moderation (triggers REST API flag).

```js
socket.emit("session:report", {
  sessionId: "64a1b2c3d4e5f6789abc1234",
  reason: "harassment"
});
```

---

## Server → Client Events

### `queue:update`
Sent to user after joining the queue.

```json
{
  "position": 3,
  "estimatedWaitMinutes": 6,
  "availableListeners": 4
}
```

---

### `queue:new_user`
Broadcast to all listeners when a user joins the queue.

```json
{
  "userId": "a3f8c2d1e9b4...",
  "mood": "anxious",
  "queueLength": 3
}
```

---

### `queue:status`
Broadcast to all clients every 10 seconds with current queue state.

```json
{
  "length": 3,
  "moods": ["anxious", "lonely", "stressed"]
}
```

---

### `session:started`
Sent to both user and listener when a session begins.

```json
{
  "roomId": "session_1719000000_abc123",
  "sessionId": "64a1b2c3d4e5f6789abc1234",
  "mood": "anxious"
}
```

---

### `chat:message`
New message received in the session room.

```json
{
  "id": "64a1b2c3d4e5f6789abc9999",
  "text": "I hear you. That sounds really difficult.",
  "senderType": "listener",
  "timestamp": "2024-01-01T10:05:30.000Z"
}
```

---

### `chat:typing`
Typing indicator from the other party.

```json
{
  "senderType": "listener",
  "isTyping": true
}
```

---

### `session:ended`
Session was ended by either party.

```json
{
  "sessionId": "64a1b2c3d4e5f6789abc1234"
}
```

---

### `report:received`
Acknowledgement that a report was filed.

```json
{}
```

---

### `error`
Server-side error during a socket operation.

```json
{
  "message": "User no longer in queue"
}
```

---

## Full Client Example (User)

```js
import { io } from "socket.io-client";

const socket = io("https://your-backend.onrender.com", {
  auth: { sessionId: "a3f8c2d1e9b4..." },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
});

// Join queue after connecting
socket.on("connect", () => {
  socket.emit("join:queue", { mood: "anxious" });
});

// Queue position updates
socket.on("queue:update", ({ position, estimatedWaitMinutes, availableListeners }) => {
  console.log(`Position #${position}, ~${estimatedWaitMinutes} min wait`);
});

// Session started — navigate to chat
socket.on("session:started", ({ roomId, sessionId }) => {
  console.log("Connected to listener!", roomId);
  // Store roomId and sessionId for chat events
});

// Receive messages
socket.on("chat:message", ({ id, text, senderType, timestamp }) => {
  console.log(`[${senderType}]: ${text}`);
});

// Typing indicator
socket.on("chat:typing", ({ senderType, isTyping }) => {
  if (senderType === "listener") {
    console.log(isTyping ? "Listener is typing..." : "");
  }
});

// Session ended
socket.on("session:ended", ({ sessionId }) => {
  console.log("Session ended:", sessionId);
  // Navigate to /post-session
});

// Send a message
function sendMessage(roomId, sessionId, text) {
  socket.emit("chat:message", { roomId, sessionId, message: text });
}
```

---

## Full Client Example (Listener)

```js
import { io } from "socket.io-client";

const socket = io("https://your-backend.onrender.com", {
  auth: { token: "eyJhbGci..." },
  transports: ["websocket", "polling"],
});

// New user in queue
socket.on("queue:new_user", ({ userId, mood, queueLength }) => {
  console.log(`New user waiting: ${mood} (queue: ${queueLength})`);
  // Show accept button in UI
});

// Accept a user
function acceptUser(userId) {
  socket.emit("listener:accept", { userId });
}

// Session started
socket.on("session:started", ({ roomId, sessionId, mood }) => {
  console.log("Session started:", mood, roomId);
});

// Receive messages
socket.on("chat:message", ({ text, senderType }) => {
  if (senderType === "user") console.log(`User: ${text}`);
});

// End session
function endSession(roomId, sessionId) {
  socket.emit("session:end", { roomId, sessionId });
}
```
