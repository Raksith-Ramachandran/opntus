"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "https://opntus-backend.onrender.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";

interface WaitingUser {
  userId: string;
  mood: string;
  waitTime: number;
  emoji: string;
}

interface ActiveSession {
  sessionId: string;
  userId: string;
  mood: string;
  duration: number;
  roomId: string;
}

const moodEmoji: Record<string, string> = {
  stressed: "😤", lonely: "🌧", anxious: "😰",
  overthinking: "🌀", relationship: "💔", academic: "📚",
  work: "💼", general: "💬",
};

export default function Dashboard() {
  const [online, setOnline] = useState(false);
  const [waiting, setWaiting] = useState<WaitingUser[]>([]);
  const [active, setActive] = useState<ActiveSession[]>([]);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const stats = [
    { label: "Today's Sessions", value: active.length.toString(), icon: "💬" },
    { label: "Waiting Users",    value: waiting.length.toString(), icon: "⏳" },
    { label: "Status",           value: online ? "Online" : "Offline", icon: "🟢" },
    { label: "Connected",        value: connected ? "Yes" : "No", icon: "🔌" },
  ];

  useEffect(() => {
    const t = localStorage.getItem("opntus_token");
    if (!t) { window.location.href = "/listener/login"; return; }
    setToken(t);

    const socket = io(WS_URL, {
      auth: { token: t },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("Dashboard connected");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setOnline(false);
    });

    // New user joined queue
    socket.on("queue:new_user", ({ userId, mood }) => {
      setWaiting(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, {
          userId,
          mood,
          waitTime: 0,
          emoji: moodEmoji[mood] || "💬",
        }];
      });
    });

    // Queue status updates every 10 seconds
    socket.on("queue:status", ({ length, moods }) => {
      console.log("Queue status:", length, "users");
    });

    // Session started after accepting
    socket.on("session:started", ({ roomId, sessionId, mood }) => {
      setActive(prev => [...prev, {
        sessionId,
        userId: "User",
        mood,
        duration: 0,
        roomId,
      }]);
      // Remove from waiting
      setWaiting(prev => prev.filter(u => u.mood !== mood));
      // Store roomId and sessionId for chat
      localStorage.setItem("opntus_room", roomId);
      localStorage.setItem("opntus_session_id", sessionId);
      // Go to chat
      window.location.href = "/chat?role=listener";
    });

    // Session ended
    socket.on("session:ended", ({ sessionId }) => {
      setActive(prev => prev.filter(s => s.sessionId !== sessionId));
    });

    socketRef.current = socket;

    // Increment wait times every minute
    const waitTimer = setInterval(() => {
      setWaiting(prev => prev.map(u => ({ ...u, waitTime: u.waitTime + 1 })));
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(waitTimer);
    };
  }, []);

  // Toggle online status
  async function toggleOnline() {
    const newStatus = !online;
    setOnline(newStatus);

    // Update status via API
    try {
      await fetch(`${API_URL}/listeners/me/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus ? "online" : "offline" }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  // Accept a waiting user
  function acceptUser(userId: string) {
    if (!socketRef.current || !online) return;
    socketRef.current.emit("listener:accept", { userId });
    // Remove from waiting list immediately
    setWaiting(prev => prev.filter(u => u.userId !== userId));
  }

  // Open active chat
  function openChat(session: ActiveSession) {
    localStorage.setItem("opntus_room", session.roomId);
    localStorage.setItem("opntus_session_id", session.sessionId);
    window.location.href = "/chat?role=listener";
  }

  // End active session
  function endSession(session: ActiveSession) {
    if (!socketRef.current) return;
    socketRef.current.emit("session:end", {
      roomId: session.roomId,
      sessionId: session.sessionId,
    });
    setActive(prev => prev.filter(s => s.sessionId !== session.sessionId));
  }

  const sc = (s: string) =>
    s === "online" ? "bg-green-400" : s === "busy" ? "bg-amber-400" : "bg-slate-400";

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#12111A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1A1928] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400">OPNTUS</span>
          <span className="text-slate-400 text-sm">/ Listener Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-slate-400">{connected ? "Connected" : "Disconnected"}</span>
          </div>
          {/* Online toggle */}
          <div className="flex items-center gap-2">
            <button onClick={toggleOnline}
              className={`relative w-12 h-6 rounded-full transition-colors ${online ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
              aria-label={online ? "Go offline" : "Go online"}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${online ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${online ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">L</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Go Online Banner */}
        {!online && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 text-center">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-3">
              You are currently offline. Go online to start accepting users.
            </p>
            <button onClick={toggleOnline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
              Go Online Now
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Waiting Users */}
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Waiting Users</h2>
              <span className="text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold px-2 py-1 rounded-full">
                {waiting.length} waiting
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {waiting.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-slate-400 text-sm">
                    {online ? "No users waiting right now" : "Go online to see waiting users"}
                  </p>
                </div>
              ) : (
                waiting.map(user => (
                  <div key={user.userId} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{user.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">{user.mood}</p>
                        <p className="text-xs text-slate-400">Waiting {user.waitTime}m</p>
                      </div>
                    </div>
                    <button onClick={() => acceptUser(user.userId)} disabled={!online}
                      className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-medium transition-colors">
                      Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chats */}
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Active Chats</h2>
              <span className="text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-semibold px-2 py-1 rounded-full">
                {active.length} active
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {active.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-slate-400 text-sm">No active chats</p>
                </div>
              ) : (
                active.map(session => (
                  <div key={session.sessionId} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-xl">{moodEmoji[session.mood] || "💬"}</span>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white dark:border-[#1A1928]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">{session.mood}</p>
                        <p className="text-xs text-slate-400">{session.duration}m</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openChat(session)}
                        className="text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Open Chat
                      </button>
                      <button onClick={() => endSession(session)}
                        className="text-xs bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        End
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-white dark:bg-[#1A1928] rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">How it works</h3>
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <div>
              <div className="text-2xl mb-2">1️⃣</div>
              <p>Toggle <strong>Online</strong> to start receiving users</p>
            </div>
            <div>
              <div className="text-2xl mb-2">2️⃣</div>
              <p>Click <strong>Accept</strong> when a user appears</p>
            </div>
            <div>
              <div className="text-2xl mb-2">3️⃣</div>
              <p>Chat opens automatically for both parties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}