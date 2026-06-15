export type Mood = "stressed"|"lonely"|"anxious"|"overthinking"|"relationship"|"academic"|"work"|"general";
export type SessionStatus = "queued"|"active"|"completed"|"abandoned";
export type ListenerStatus = "online"|"busy"|"offline"|"suspended";
export type SenderType = "user"|"listener"|"system";

export interface Message {
  id: string;
  sessionId: string;
  senderType: SenderType;
  text: string;
  timestamp: Date;
  status?: "sending"|"sent"|"read";
}

export interface Session {
  id: string;
  userId: string;
  listenerId?: string;
  mood: Mood;
  status: SessionStatus;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
}

export interface QueueUpdate {
  position: number;
  estimatedWaitMinutes: number;
  availableListeners: number;
}
