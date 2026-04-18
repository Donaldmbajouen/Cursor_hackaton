/**
 * server.js — HTTP + Socket.io + démarrage du serveur
 * Responsable : Dev Backend (temps réel)
 */
import 'dotenv/config';
import './db/database.js';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { voteHandler } from './sockets/voteHandler.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

voteHandler(io);

server.listen(PORT, () => {
  // TODO Dev : logger structuré
  console.log(`VoteChain backend listening on port ${PORT}`);
});
