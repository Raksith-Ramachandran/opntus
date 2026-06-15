"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting...");
  const [logs, setLogs] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  const [waiting, setWaiting] = useState<any[]>([]);
  const [authed, setAuthed] = useState(false);
  const socketRef = useRef<any>(null);
  const onlineRef = useRef(false);
  const redirectingRef = useRef(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    const token = localStorage.getItem("opntus_token");
    if (!token) { router.replace("/listener/login"); return; }
    setAuthed(true);

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "https://opntus-backend.onrender.com";
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
        // Re-sync online status on reconnect
        if (onlineRef.current) {
          const API = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";
          fetch(`${API}/listeners/me/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ status: "online" }),
          }).catch(() => {});
        }
      });

      socket.on("connect_error", (err: any) => {
        setStatus("❌ Error: " + err.message);
        addLog("Error: " + err.message);
      });

      // Only update UI on disconnect — do NOT set offline here
      // Backend handles offline on permanent disconnect via socket middleware
      socket.on("disconnect", (reason: string) => {
        setStatus("⚠️ Disconnected: " + reason + " (reconnecting...)");
        addLog("Disconnected: " + reason);
      });

      socket.on("queue:new_user", (data: any) => {
        addLog("🙋 New user: " + data.mood);
        setWaiting((prev: any[]) => [...prev, data]);
      });

      socket.on("session:started", (data: any) => {
        if (redirectingRef.current) return;
        redirectingRef.current = true;
        addLog("🎉 Session started: " + data.roomId);
        localStorage.setItem("opntus_room", String(data.roomId));
        localStorage.setItem("opntus_session_id", String(data.sessionId));
        addLog("Navigating to chat...");
        window.location.href = "/chat?role=listener";
      });
    });

    return () => {
      if (socketRef.current && !redirectingRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  async function toggleOnline() {
    const token = localStorage.getItem("opntus_token");
    const newStatus = !online;
    setOnline(newStatus);
    onlineRef.current = newStatus;
    addLog(newStatus ? "🟢 Going online" : "🔴 Going offline");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "https://opntus-backend.onrender.com/api";
      await fetch(`${API}/listeners/me/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus ? "online" : "offline" }),
      });
      addLog("Status updated on server");
    } catch {
      addLog("Failed to update status");
    }
  }

  function acceptUser(userId: string, mood: string) {
    if (!socketRef.current) return;
    socketRef.current.emit("listener:accept", { userId });
    setWaiting(prev => prev.filter((u: any) => u.userId !== userId));
    addLog("Accepted user: " + mood);
  }

  // Prevent flash of dashboard before auth check
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#12111A] p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-white dark:bg-[#1A1928] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100">OPNTUS Listener Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">{status}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{online ? "Online" : "Offline"}</span>
            <button onClick={toggleOnline}
              className={`relative w-12 h-6 rounded-full transition-colors ${online ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${online ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {!online && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-3">Toggle Online to receive users</p>
            <button onClick={toggleOnline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
              Go Online Now
            </button>
          </div>
        )}

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
                  {online ? "No users waiting right now. When users join they appear here." : "Go online to see waiting users"}
                </p>
              </div>
            ) : (
              waiting.map((user: any, i: number) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">{user.mood}</p>
                    <p className="text-xs text-slate-400">Waiting in queue</p>
                  </div>
                  <button onClick={() => acceptUser(user.userId, user.mood)} disabled={!online}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-4 py-2 rounded-full font-medium transition-colors">
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0d1117] rounded-2xl p-6">
          <p className="text-green-400 font-mono text-xs font-bold mb-3">Connection Logs:</p>
          {logs.length === 0
            ? <p className="text-slate-500 font-mono text-xs">Waiting for logs...</p>
            : logs.map((log, i) => <p key={i} className="text-green-300 font-mono text-xs leading-relaxed">{log}</p>)
          }
        </div>

      </div>
    </div>
  );
}
