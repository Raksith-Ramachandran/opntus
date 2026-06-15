"use client";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export function useVoiceChat(socket: Socket | null, roomId: string | null) {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  async function startCall() {
    if (!socket || !roomId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const peer = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = peer;

      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("voice:ice-candidate", { roomId, candidate });
      };

      peer.ontrack = ({ streams }) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = streams[0];
          remoteAudioRef.current.play();
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("voice:offer", { roomId, offer });
      setInCall(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use voice chat.");
    }
  }

  function endCall() {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();
    setInCall(false);
  }

  function toggleMute() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!muted); }
  }

  useEffect(() => {
    if (!socket) return;

    socket.on("voice:offer", async ({ offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const peer = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = peer;
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
      peer.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("voice:ice-candidate", { roomId, candidate });
      };
      peer.ontrack = ({ streams }) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = streams[0];
          remoteAudioRef.current.play();
        }
      };
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("voice:answer", { roomId, answer });
      setInCall(true);
    });

    socket.on("voice:answer", async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(answer);
    });

    socket.on("voice:ice-candidate", async ({ candidate }) => {
      await peerRef.current?.addIceCandidate(candidate);
    });

    return () => {
      socket.off("voice:offer");
      socket.off("voice:answer");
      socket.off("voice:ice-candidate");
    };
  }, [socket, roomId]);

  return { inCall, muted, startCall, endCall, toggleMute, remoteAudioRef };
}