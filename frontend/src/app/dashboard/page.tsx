"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [logs, setLogs] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  const [waiting, setWaiting] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const socketRef = useRef<any>(null);
  const redirectingRef = useRef(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev.slice(-30), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const token = localStorage.getItem("opntus_token");
    if (!token) {
      router.replace("/listener/login");
      return;
    }
    setAuthed(true);

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "https://opntus-backend.onrender.com";
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";

    addLog(`Connecting to ${WS_URL}`);

    import("socket.io-client").then(({ io }) => {
      const socket = io(WS_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("✅ Connected: " + socket.id);
        addLog("Connected! ID: " + socket.id);
      });

      socket.on("connect_error", (err: any) => {
        setStatus("❌ Error: " + err.message);
        addLog("Connection error: " + err.message);
      });

      socket.on("disconnect", (reason: string) => {
        setStatus("⚠️ Disconnected: " + reason);
        addLog("Disconnected: " + reason);
      });

      socket.on("queue:new_user", (data: any) => {
        addLog(`🙋 New user in queue: ${data.mood} (ID: ${data.userId})`);
        setWaiting(prev => {
          if (prev.find((u: any) => u.userId === data.userId)) return prev;
          return [...prev, { userId: data.userId, mood: data.mood, waitTime: 0 }];
        });
      });

      socket.on("queue:status", (data: any) => {
        addLog(`📊 Queue status: ${data.length} users`);
      });

      socket.on("session:started", (data: any) => {
        if (redirectingRef.current) return;
        redirectingRef.current = true;
        addLog(`🎉 Session started! Room: ${data.roomId}`);
        localStorage.setItem("opntus_room", String(data.roomId));
        localStorage.setItem("opntus_session_id", String(data.sessionId));
        setActive(prev => [...prev, data]);
        window.location.href = "/chat?role=listener";
      });

      socket.on("session:ended", (data: any) => {
        addLog(`Session ended: ${data.sessionId}`);
        setActive(prev => prev.filter((s: any) => s.sessionId !== data.sessionId));
      });
    });

    return () => {
      if (socketRef.current && !redirectingRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (!authed) return null;

  async function toggleOnline() {
    const token = localStorage.getItem("opntus_token");
    const newStatus = !online;
    setOnline(newStatus);
    addLog(newStatus ? "🟢 Going online" : "🔴 Going offline");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";
      await fetch(`${API_URL}/listeners/me/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus ? "online" : "offline" }),
      });
      addLog("✅ Status updated on server");
    } catch {
      addLog("❌ Failed to update status");
    }
  }

  function acceptUser(userId: string, mood: string) {
    if (!socketRef.current || !online) return;
    addLog(`Accepting user: ${userId} (${mood})`);
    socketRef.current.emit("listener:accept", { userId });
    setWaiting(prev => prev.filter((u: any) => u.userId !== userId));
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#12111A] p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">
              OPNTUS / Listener Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">{status}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {online ? "Online" : "Offline"}
            </span>
            <button onClick={toggleOnline}
              className={`relative w-12 h-6 rounded-full transition-colors ${online ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${online ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Go Online Banner */}
        {!online && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-3">
              Toggle <strong>Online</strong> to start receiving users
            </p>
            <button onClick={toggleOnline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
              Go Online Now
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{waiting.length}</div>
            <div className="text-xs text-slate-500">Waiting Users</div>
          </div>
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{active.length}</div>
            <div className="text-xs text-slate-500">Active Chats</div>
          </div>
          <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl mb-2">{online ? "🟢" : "🔴"}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{online ? "Online" : "Offline"}</div>
            <div className="text-xs text-slate-500">Your Status</div>
          </div>
        </div>

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
                  {online
                    ? "No users waiting. When users join they appear here instantly."
                    : "Go online to see waiting users."}
                </p>
              </div>
            ) : (
              waiting.map((user: any, i: number) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                      {user.mood}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">ID: {user.userId?.slice(0, 12)}...</p>
                  </div>
                  <button
                    onClick={() => acceptUser(user.userId, user.mood)}
                    disabled={!online}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-medium transition-colors">
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connection Logs */}
        <div className="bg-[#0d1117] rounded-2xl p-6">
          <p className="text-green-400 font-mono text-xs font-bold mb-3">
            🔌 Connection Logs (real-time):
          </p>
          {logs.length === 0
            ? <p className="text-slate-500 font-mono text-xs">Waiting for events...</p>
            : logs.map((log, i) => (
                <p key={i} className="text-green-300 font-mono text-xs leading-relaxed">{log}</p>
              ))
          }
        </div>

      </div>
    </div>
  );
}