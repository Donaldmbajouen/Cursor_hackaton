/**
 * api.js — Client HTTP VoteChain
 */
import { getAuthToken } from '../utils/auth.js';

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
  if (options.auth !== false) {
    const token = getAuthToken();
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const { auth: _ignored, ...fetchOpts } = options;
  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOpts, headers });
  if (res.status === 204) {
    return null;
  }
  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    const msg =
      body.error || formatDetail(body.detail) || res.statusText || 'Erreur réseau';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
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

export function register({ email, password, name }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
    auth: false,
  });
}

export function login({ email, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

export function fetchMe() {
  return apiFetch('/api/auth/me');
}

export function fetchMyPolls() {
  return apiFetch('/api/me/polls');
}

export function fetchMyStats() {
  return apiFetch('/api/me/stats');
}

export function deleteMyPoll(pollId) {
  return apiFetch(`/api/me/polls/${pollId}`, { method: 'DELETE' });
}
