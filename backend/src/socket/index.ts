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
      } else if (sessionId) {
        (socket.data as SocketData).userId = sessionId;
        (socket.data as SocketData).userType = "user";
      } else {
        return next(new Error("Authentication required"));
      }
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const data = socket.data as SocketData;
    const safeId = socket.id.replace(/[\r\n\t\x00-\x1f]/g, "");
    logger.info(`Socket connected: ${safeId} (${data.userType})`);
    if (data.userType === "listener" && data.listenerId) listenerSockets.set(data.listenerId, socket.id);
    else if (data.userId) userSockets.set(data.userId, socket.id);

    socket.on("join:queue", async ({ mood }: { mood: string }) => {
      if (data.userType !== "user" || !data.userId) return;
      try {
        if (!queue.find(q => q.userId === data.userId))
          queue.push({ userId: data.userId!, mood, socketId: socket.id, joinedAt: new Date() });
        const position = queue.findIndex(q => q.userId === data.userId) + 1;
        const availableListeners = await Listener.countDocuments({ status: "online" });
        socket.emit("queue:update", { position, estimatedWaitMinutes: Math.max(1, position * 2), availableListeners });
        io.emit("queue:new_user", { userId: data.userId, mood, queueLength: queue.length });
      } catch (err) {
        logger.error("join:queue error:", err);
        socket.emit("error", { message: "Failed to join queue" });
      }
    });

    socket.on("leave:queue", () => {
      if (!data.userId) return;
      const idx = queue.findIndex(q => q.userId === data.userId);
      if (idx !== -1) queue.splice(idx, 1);
    });

    socket.on("listener:accept", async ({ userId }: { userId: string }) => {
      if (data.userType !== "listener" || !data.listenerId) return;
      try {
        const idx = queue.findIndex(q => q.userId === userId);
        if (idx === -1) { socket.emit("error", { message: "User no longer in queue" }); return; }
        const queued = queue.splice(idx, 1)[0];
        const roomId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        // Fix: use queued.userId (not data.listenerId) for the userId field
        const session = await Session.create({ userId: queued.userId, listenerId: data.listenerId, mood: queued.mood, status: "active", startedAt: new Date() });
        activeRooms.set(roomId, { userId, listenerId: data.listenerId! });
        socket.join(roomId);
        const userSocketId = userSockets.get(userId);
        if (userSocketId) io.sockets.sockets.get(userSocketId)?.join(roomId);
        await Listener.findByIdAndUpdate(data.listenerId, { status: "busy" });
        socket.emit("session:started", { roomId, sessionId: session._id, mood: queued.mood });
        if (userSocketId) io.to(userSocketId).emit("session:started", { roomId, sessionId: session._id, mood: queued.mood });
      } catch (err) {
        logger.error("listener:accept error:", err);
        socket.emit("error", { message: "Failed to start session" });
      }
    });

    socket.on("chat:message", async ({ roomId, message, sessionId }) => {
      if (!message || typeof message !== "string" || message.length > 5000) return;
      try {
        const sanitized = message.trim().replace(/[<>]/g, "");
        const saved = await Message.create({ sessionId, senderType: data.userType, message: sanitized, timestamp: new Date() });
        io.to(roomId).emit("chat:message", { id: saved._id, text: sanitized, senderType: data.userType, timestamp: saved.timestamp });
      } catch (err) {
        logger.error("chat:message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("chat:typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("chat:typing", { senderType: data.userType, isTyping });
    });

    socket.on("session:end", async ({ roomId, sessionId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;
      try {
        const endedAt = new Date();
        const session = await Session.findByIdAndUpdate(sessionId, { status: "completed", endedAt }, { new: true });
        if (session?.startedAt) {
          const dur = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);
          await Session.findByIdAndUpdate(sessionId, { durationSeconds: dur });
          await Listener.findByIdAndUpdate(room.listenerId, { status: "online", $inc: { totalSessions: 1 } });
        }
        io.to(roomId).emit("session:ended", { sessionId });
        activeRooms.delete(roomId);
      } catch (err) {
        logger.error("session:end error:", err);
        socket.emit("error", { message: "Failed to end session" });
      }
    });

    socket.on("disconnect", async () => {
      if (data.userId) {
        const idx = queue.findIndex(q => q.userId === data.userId);
        if (idx !== -1) queue.splice(idx, 1);
        userSockets.delete(data.userId);
      }
      if (data.listenerId) {
        listenerSockets.delete(data.listenerId);
        try { await Listener.findByIdAndUpdate(data.listenerId, { status: "offline" }); }
        catch (err) { logger.error("disconnect listener update error:", err); }
      }
    });
  });

  setInterval(() => io.emit("queue:status", { length: queue.length, moods: queue.map(q => q.mood) }), 10000);
}
