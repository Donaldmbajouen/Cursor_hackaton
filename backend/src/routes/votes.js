/**
 * votes.js — Routes REST /api/votes
 * Responsable : Dev Backend (API + anti-fraude)
 */
import { Router } from 'express';
import { voteRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// TODO Dev : appliquer voteRateLimiter / antifraud / jwt sur les bonnes routes
router.use(voteRateLimiter);

// TODO Dev : POST / — enregistrer un vote
router.post('/', (req, res) => {
  res.status(501).json({ message: 'TODO' });
});

export default router;
