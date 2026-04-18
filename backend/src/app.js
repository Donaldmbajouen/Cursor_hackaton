/**
 * app.js — Application Express (sans listen)
 * Responsable : Dev Backend (API)
 */
import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// TODO Dev : monter les middlewares globaux (logging, erreurs, rate limit ciblé, etc.)

app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

export default app;
