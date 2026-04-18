/**
 * api.js — Client HTTP vers le backend Express
 * Responsable : Dev Frontend
 */

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// TODO Dev : helpers get/post, gestion erreurs, headers fingerprint / JWT
export async function fetchPoll(pollId) {
  // TODO
  return fetch(`${baseUrl}/api/polls/${pollId}`);
}

export async function createPoll(/* body */) {
  // TODO
  return fetch(`${baseUrl}/api/polls`, { method: 'POST' });
}
