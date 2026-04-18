/**
 * polls.js — Routes REST /api/polls
 * Responsable : Dev Backend (API)
 */
import { Router } from 'express';

const router = Router();

// TODO Dev : GET / — lister les sondages (pagination ?)
router.get('/', (req, res) => {
  res.status(501).json({ message: 'TODO' });
});

// TODO Dev : GET /:id — détail d’un sondage
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'TODO' });
});

// TODO Dev : POST / — créer un sondage
router.post('/', (req, res) => {
  res.status(501).json({ message: 'TODO' });
});

export default router;
