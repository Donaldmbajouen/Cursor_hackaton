/**
 * rateLimiter.js — Middleware IP rate limiting
 * Responsable : Dev 1 (Senior - Anti-fraude)
 * Limite : 1 vote par IP par sondage (à affiner par poll_id)
 */
import rateLimit from 'express-rate-limit';

// TODO Dev 1 : configurer les fenêtres de temps et les messages d’erreur
export const voteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  // TODO : personnaliser le message de refus
});
