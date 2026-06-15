import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | undefined;
let currentSessionId: string | undefined;

export function getSocket(token?: string, sessionId?: string): Socket {
  const authChanged = token !== currentToken || sessionId !== currentSessionId;
  if (socket && authChanged) {
    socket.disconnect();
    socket = null;
  }
  if (!socket) {
    currentToken = token;
    currentSessionId = sessionId;
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", {
      auth: { token, sessionId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = undefined;
    currentSessionId = undefined;
  }
}
