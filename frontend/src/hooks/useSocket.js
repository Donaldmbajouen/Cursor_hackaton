/**
 * useSocket.js — Hook connexion Socket.io client
 * Responsable : Dev Frontend (temps réel)
 */
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// TODO Dev : options auth, namespaces, cleanup, reconnexion
export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    void io;
    void baseUrl;
    // TODO : const s = io(baseUrl, { ... })
    setSocket(null);
    return () => {
      // TODO : socket?.disconnect()
    };
  }, []);

  return socket;
}
