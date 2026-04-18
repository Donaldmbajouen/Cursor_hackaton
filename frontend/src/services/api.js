/**
 * api.js — Client HTTP VoteChain
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function formatDetail(detail) {
  if (detail == null) return 'Erreur inconnue';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (typeof e === 'object' && e.msg ? e.msg : JSON.stringify(e)))
      .join(', ');
  }
  if (typeof detail === 'object' && detail.message) return String(detail.message);
  return JSON.stringify(detail);
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    const msg =
      body.error || formatDetail(body.detail) || res.statusText || 'Erreur réseau';
    throw new Error(msg);
  }
  return body;
}

export function createPoll(data) {
  return apiFetch('/api/polls/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPolls() {
  return apiFetch('/api/polls/');
}

export function getPoll(id) {
  return apiFetch(`/api/polls/${id}`);
}

export function getPollResults(id) {
  return apiFetch(`/api/polls/${id}/results`);
}

export function getSession(pollId) {
  return apiFetch(`/api/polls/${pollId}/session`, { method: 'POST' });
}

export function castVote(pollId, data) {
  return apiFetch(`/api/votes/${pollId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
