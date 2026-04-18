/**
 * voteHandler.js — Événements Socket.io liés aux votes / résultats
 * Responsable : Dev Backend (temps réel)
 */

// TODO Dev : join room par poll_id, broadcast des agrégats, validation côté serveur
export function voteHandler(io) {
  io.on('connection', (socket) => {
    // TODO : handshake auth, rooms
    socket.on('disconnect', () => {
      // TODO
    });
  });
}
