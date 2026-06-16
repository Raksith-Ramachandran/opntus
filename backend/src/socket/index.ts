import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Session } from "../models/Session";
import { Message } from "../models/Message";
import { Listener } from "../models/Listener";
import { logger } from "../utils/logger";

interface SocketData {
  userId?: string;
  listenerId?: string;
  userType: "user" | "listener";
}

const queue: Array<{ userId: string; mood: string; socketId: string; joinedAt: Date }> = [];
const activeRooms = new Map<string, { userId: string; listenerId: string }>();
const listenerSockets = new Map<string, string>();
const userSockets = new Map<string, string>();

export function initSocket(io: SocketServer) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const sessionId = socket.handshake.auth.sessionId;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
        const listener = await Listener.findById(decoded.id);
        if (!listener || listener.status === "suspended") return next(new Error("Unauthorized"));
        (socket.data as SocketData).listenerId = decoded.id;
        (socket.data as SocketData).userType = "listener";
        logger.info(`Listener connected: ${decoded.id}`);
      } else if (sessionId) {
        (socket.data as SocketData).userId = sessionId;
        (socket.data as SocketData).userType = "user";
        logger.info(`User connected: ${sessionId}`);
      } else {
        return next(new Error("Authentication required"));
      }
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const data = socket.data as SocketData;
    logger.info(`Socket connected: ${socket.id} type=${data.userType}`);

   if (data.userType === "listener" && data.listenerId) {
  listenerSockets.set(data.listenerId, socket.id);
  logger.info(`Listener socket mapped: ${data.listenerId} -> ${socket.id}`);
} else if (data.userId) {
  userSockets.set(data.userId, socket.id);
  logger.info(`User socket mapped: ${data.userId} -> ${socket.id}`);
}

    // User joins queue
    socket.on("join:queue", async ({ mood }: { mood: string }) => {
      if (data.userType !== "user" || !data.userId) return;
      if (!queue.find(q => q.userId === data.userId)) {
        queue.push({ userId: data.userId!, mood, socketId: socket.id, joinedAt: new Date() });
        logger.info(`User ${data.userId} joined queue. Mood: ${mood}. Queue length: ${queue.length}`);
      }
      const position = queue.findIndex(q => q.userId === data.userId) + 1;
      const availableListeners = await Listener.countDocuments({ status: "online" });
      socket.emit("queue:update", {
        position,
        estimatedWaitMinutes: Math.max(1, position * 2),
        availableListeners,
      });
      // Notify all listeners
      io.emit("queue:new_user", { userId: data.userId, mood, queueLength: queue.length });
    });

    // User leaves queue
    socket.on("leave:queue", () => {
      if (!data.userId) return;
      const idx = queue.findIndex(q => q.userId === data.userId);
      if (idx !== -1) queue.splice(idx, 1);
    });

    // Listener rejoins existing room (after navigation)
    socket.on("join:room", async ({ roomId }: { roomId: string }) => {
  socket.join(roomId);
  logger.info(`${data.userType} rejoined room ${roomId}`);

  if (data.userType === "listener" && data.listenerId) {
    // Update listener socket mapping
    listenerSockets.set(data.listenerId, socket.id);
    const room = activeRooms.get(roomId);
    if (room && room.listenerId === data.listenerId) {
      await Listener.findByIdAndUpdate(data.listenerId, { status: "busy" });
    }
  } else if (data.userType === "user" && data.userId) {
    // Update user socket mapping
    userSockets.set(data.userId, socket.id);
  }
});

    // Listener accepts user
    socket.on("listener:accept", async ({ userId }: { userId: string }) => {
  if (data.userType !== "listener" || !data.listenerId) return;
  logger.info(`Listener ${data.listenerId} accepting user ${userId}`);

  const idx = queue.findIndex(q => q.userId === userId);
  if (idx === -1) {
    socket.emit("error", { message: "User no longer in queue" });
    return;
  }

  const queued = queue.splice(idx, 1)[0];
  const roomId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Create session
  const session = await Session.create({
    userId: queued.userId,
    listenerId: data.listenerId,
    mood: queued.mood,
    status: "active",
    startedAt: new Date(),
  });

  activeRooms.set(roomId, {
    userId: queued.userId,
    listenerId: data.listenerId!,
  });

  // Join listener to room
  socket.join(roomId);
  logger.info(`Listener joined room ${roomId}`);

  const sessionData = {
    roomId,
    sessionId: String(session._id),
    mood: queued.mood,
  };

  // Find user socket — try multiple times
  const tryNotifyUser = (attempts: number) => {
    const userSocketId = userSockets.get(queued.userId);
    logger.info(`Looking for user socket. userId=${queued.userId} socketId=${userSocketId} attempt=${attempts}`);

    if (userSocketId) {
      const userSocket = io.sockets.sockets.get(userSocketId);
      if (userSocket) {
        userSocket.join(roomId);
        userSocket.emit("session:started", sessionData);
        logger.info(`✅ Emitted session:started to user via socket ${userSocketId}`);
      } else {
        // Emit directly to socketId
        io.to(userSocketId).emit("session:started", sessionData);
        logger.info(`✅ Emitted session:started to user via room ${userSocketId}`);
      }
    } else if (attempts > 0) {
      // Retry after 500ms
      logger.info(`User socket not found, retrying in 500ms...`);
      setTimeout(() => tryNotifyUser(attempts - 1), 500);
    } else {
      logger.warn(`❌ Could not find user socket after all attempts`);
    }
  };

  // Update listener status
  await Listener.findByIdAndUpdate(data.listenerId, { status: "busy" });

  // Notify listener immediately
  socket.emit("session:started", sessionData);
  logger.info(`Emitted session:started to listener`);

  // Notify user with retries
  tryNotifyUser(5);
});

    // Chat message
    socket.on("chat:message", async ({ roomId, message, sessionId }) => {
      if (!message || typeof message !== "string" || message.length > 5000) return;
      const sanitized = message.trim().replace(/[<>]/g, "");
      const saved = await Message.create({
        sessionId,
        senderType: data.userType,
        message: sanitized,
        timestamp: new Date(),
      });
      io.to(roomId).emit("chat:message", {
        id: String(saved._id),
        text: sanitized,
        senderType: data.userType,
        timestamp: saved.timestamp,
      });
    });

    // Typing indicator
    socket.on("chat:typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("chat:typing", { senderType: data.userType, isTyping });
    });

    // Voice signaling
    socket.on("voice:offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("voice:offer", { offer });
    });
    socket.on("voice:answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("voice:answer", { answer });
    });
    socket.on("voice:ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("voice:ice-candidate", { candidate });
    });

    // End session
    socket.on("session:end", async ({ roomId, sessionId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;
      const endedAt = new Date();
      const session = await Session.findByIdAndUpdate(
        sessionId, { status: "completed", endedAt }, { new: true }
      );
      if (session?.startedAt) {
        const dur = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);
        await Session.findByIdAndUpdate(sessionId, { durationSeconds: dur });
        await Listener.findByIdAndUpdate(room.listenerId, {
          status: "online",
          $inc: { totalSessions: 1 },
        });
      }
      io.to(roomId).emit("session:ended", { sessionId });
      activeRooms.delete(roomId);
    });

    // Disconnect
    socket.on("disconnect", async () => {
      logger.info(`Socket disconnected: ${socket.id} type=${data.userType}`);

      if (data.userId) {
        const idx = queue.findIndex(q => q.userId === data.userId);
        if (idx !== -1) queue.splice(idx, 1);
        userSockets.delete(data.userId);
      }

      if (data.listenerId) {
        const previousSocketId = listenerSockets.get(data.listenerId);
        if (previousSocketId === socket.id) {
          listenerSockets.delete(data.listenerId);
        }
        // Grace period — wait 8 seconds before marking offline
        setTimeout(async () => {
          const currentSocketId = listenerSockets.get(data.listenerId!);
          if (!currentSocketId) {
            await Listener.findByIdAndUpdate(data.listenerId, { status: "offline" });
            logger.info(`Listener ${data.listenerId} marked offline after grace period`);
          }
        }, 8000);
      }
    });
  });

  setInterval(() => {
    io.emit("queue:status", { length: queue.length, moods: queue.map(q => q.mood) });
  }, 10000);
}