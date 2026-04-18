/**
 * useSocket.js — Hook WebSocket (compteurs / événements vote, aligné FastAPI)
 * Responsable : Dev Frontend (temps réel)
 */
import { useEffect, useRef, useState } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function toWebSocketUrl(httpUrl, path) {
  const u = new URL(httpUrl);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = path;
  u.search = '';
  u.hash = '';
  return u.toString();
}

// TODO Dev : reconnexion exponentielle, heartbeat, auth query param
export function useVoteWebSocket(pollId) {
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CLOSED);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!pollId) return undefined;
    const url = toWebSocketUrl(apiBase, `/ws/votes/${pollId}`);
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setReadyState(ws.readyState);
    ws.onopen = () => setReadyState(ws.readyState);
    ws.onclose = () => setReadyState(WebSocket.CLOSED);
    ws.onmessage = (ev) => setLastMessage(ev.data);
    ws.onerror = () => {
      // TODO : telemetry / toast
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [pollId]);

  return { socket: wsRef.current, readyState, lastMessage };
}

/** @deprecated préférer useVoteWebSocket — alias pour imports historiques */
export function useSocket(pollId) {
  return useVoteWebSocket(pollId);
}

