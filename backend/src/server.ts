import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes    from "./routes/auth";
import sessionRoutes from "./routes/sessions";
import listenerRoutes from "./routes/listeners";
import adminRoutes   from "./routes/admin";
import userRoutes    from "./routes/users";
import { initSocket } from "./socket";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketServer(server, {
  cors: { origin: process.env.FRONTEND_URL||"http://localhost:3000", methods:["GET","POST"], credentials:true },
  transports: ["websocket","polling"],
});
initSocket(io);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy:false, crossOriginEmbedderPolicy:false }));
app.use(cors({ origin:process.env.FRONTEND_URL||"http://localhost:3000", credentials:true, methods:["GET","POST","PUT","DELETE","PATCH"], allowedHeaders:["Content-Type","Authorization"] }));

const globalLimiter = rateLimit({ windowMs:15*60*1000, max:100, standardHeaders:true, legacyHeaders:false, message:{error:"Too many requests."} });
const strictLimiter = rateLimit({ windowMs:60*60*1000, max:10,  standardHeaders:true, legacyHeaders:false, message:{error:"Too many auth requests."} });

app.use("/api/", globalLimiter);
app.use("/api/auth/", strictLimiter);
app.use(express.json({ limit:"10kb" }));
app.use(express.urlencoded({ extended:true, limit:"10kb" }));
app.use(mongoSanitize());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req,res) => res.json({ status:"ok", ts:new Date().toISOString() }));
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/sessions",  sessionRoutes);
app.use("/api/listeners", listenerRoutes);
app.use("/api/admin",     adminRoutes);
app.use((_req,res) => res.status(404).json({ error:"Not found" }));
app.use(errorHandler);

// ── DB & Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT||5000;
mongoose.connect(process.env.MONGODB_URI!)
  .then(()=>{ logger.info("MongoDB connected"); server.listen(PORT,()=>logger.info(`Server on :${PORT}`)); })
  .catch(err=>{ logger.error("MongoDB error:",err); process.exit(1); });

process.on("SIGTERM",()=>{ logger.info("Shutting down..."); server.close(()=>{ mongoose.connection.close(); process.exit(0); }); });
export { io };
export default app;
