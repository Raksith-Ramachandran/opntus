"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useVoiceChat } from "@/hooks/useVoiceChat";

interface Msg {
  id: string;
  text: string;
  sender: "user" | "listener";
  ts: Date;
  status: "sending" | "sent" | "read";
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "https://opntus-backend.onrender.com";

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [listenerTyping, setLTyping] = useState(false);
  const [sessionSecs, setSecs] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [queuePos, setQueuePos] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { inCall, muted, startCall, endCall, toggleMute, remoteAudioRef } = useVoiceChat(socketRef.current, roomId);
  const [anonName, setAnonName] = useState("Anonymous");
  const [mood, setMood] = useState("general");

  useEffect(() => {
    // Get session info from localStorage
    const storedSession = localStorage.getItem("opntus_session");
    const storedName = localStorage.getItem("opntus_name");
    const storedMood = localStorage.getItem("opntus_mood");

    if (storedSession) setSessionId(storedSession);
    if (storedName) setAnonName(storedName);
    if (storedMood) setMood(storedMood);

    // Connect socket
    const socket = io(WS_URL, {
      auth: { sessionId: storedSession },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      setConnected(true);
      // Join queue
      socket.emit("join:queue", { mood: storedMood || "general" });
    });

    socket.on("disconnect", () => setConnected(false));

    // Queue position updates
    socket.on("queue:update", ({ position, estimatedWaitMinutes, availableListeners }) => {
      setQueuePos(position);
    });

    // Session started — listener accepted
    socket.on("session:started", ({ roomId: rId, sessionId: sId }) => {
      setRoomId(rId);
      setSessionId(sId);
      setWaiting(false);
      setMsgs([{
        id: "welcome",
        text: "You are now connected with a listener. Feel free to share.",
        sender: "listener",
        ts: new Date(),
        status: "read",
      }]);
    });

    // Receive messages
    socket.on("chat:message", ({ id, text, senderType, timestamp }) => {
      if (senderType === "listener") {
        setMsgs(prev => [...prev, {
          id,
          text,
          sender: "listener",
          ts: new Date(timestamp),
          status: "read",
        }]);
      }
    });

    // Typing indicator
    socket.on("chat:typing", ({ senderType, isTyping }) => {
      if (senderType === "listener") setLTyping(isTyping);
    });

    // Session ended by listener
    socket.on("session:ended", () => {
      window.location.href = "/post-session";
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, []);

  // Session timer — only when connected
  useEffect(() => {
    if (waiting) return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [waiting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, listenerTyping]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const fmtT = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const send = useCallback(() => {
    if (!input.trim() || !socketRef.current || !roomId) return;
    const id = Date.now().toString();
    const msg: Msg = {
      id,
      text: input.trim(),
      sender: "user",
      ts: new Date(),
      status: "sending",
    };
    setMsgs(prev => [...prev, msg]);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    socketRef.current.emit("chat:message", {
      roomId,
      sessionId,
      message: input.trim(),
    });

    setTimeout(() => {
      setMsgs(prev => prev.map(m => m.id === id ? { ...m, status: "sent" } : m));
    }, 500);
  }, [input, roomId, sessionId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit("chat:typing", { roomId, isTyping });
  }, [roomId]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const endSession = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("session:end", { roomId, sessionId });
    }
    window.location.href = "/post-session";
  };

  // Show queue waiting screen
  if (waiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-[#E8F4F0] dark:from-[#12111A] dark:to-[#111820]">
        <div className="text-center">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-30 mx-auto mb-6"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
            {connected ? "Finding a listener..." : "Connecting..."}
          </h2>
          {queuePos > 0 && (
            <p className="text-slate-500 dark:text-slate-400">
              Queue position: <span className="font-bold text-blue-600">#{queuePos}</span>
            </p>
          )}
          <p className="text-sm text-slate-400 mt-4">
            You are: <span className="font-mono font-semibold text-blue-500">{anonName}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F7FF] dark:bg-[#12111A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A1928] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">L</div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1A1928] ${connected ? "bg-green-400" : "bg-slate-400"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Listener</p>
            <p className="text-xs text-slate-400">{connected ? "Online" : "Reconnecting..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400">Session</p>
            <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{fmt(sessionSecs)}</p>
          </div>
          <button onClick={() => setShowEnd(true)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium transition-colors">End</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <p className="text-center text-xs text-slate-400 mb-6">
          You are <span className="font-mono font-semibold text-blue-500">{anonName}</span>. This session is private.
        </p>
        {msgs.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] md:max-w-[60%] px-4 py-3 ${
              m.sender === "user"
                ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                : "bg-white dark:bg-[#1A1928] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-sm"
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <span className={`text-[10px] ${m.sender === "user" ? "text-blue-200" : "text-slate-400"}`}>{fmtT(m.ts)}</span>
                {m.sender === "user" && <span className="text-[10px] text-blue-200">{m.status === "sending" ? "◌" : "✓✓"}</span>}
              </div>
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {listenerTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="bg-white dark:bg-[#1A1928] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-2 h-2 rounded-full bg-slate-400"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-[#1A1928] border-t border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea ref={taRef} value={input}
            onChange={e => { setInput(e.target.value); sendTyping(true); setTimeout(() => sendTyping(false), 1000); }}
            onKeyDown={onKey}
            onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 128)}px`; }}
            placeholder="Type something… (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#F8F7FF] dark:bg-[#12111A] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors max-h-32 overflow-y-auto" />
          <button onClick={send} disabled={!input.trim()} aria-label="Send"
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* End Modal */}
      <AnimatePresence>
        {showEnd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#1A1928] rounded-2xl p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-4xl mb-4">🌸</div>
              <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">End this session?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">You can always come back.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowEnd(false)} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">Keep Talking</button>
                <button onClick={endSession} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">End Session</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}