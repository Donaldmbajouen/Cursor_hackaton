/**
 * api.js — Client HTTP vers le backend FastAPI
 * Responsable : Dev Frontend
 */
import { readToken } from '../utils/token.js';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(status, message, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, headers = {}, fingerprint, pollId } = {}) {
  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (fingerprint) {
    finalHeaders['X-Fingerprint'] = fingerprint;
  }
  const token = pollId ? readToken('token', pollId) : null;
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, 'Réseau indisponible', { cause: String(err) });
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const message =
      (payload && (payload.detail || payload.message)) ||
      response.statusText ||
      'Erreur API';
    throw new ApiError(response.status, message, payload);
  }

  return payload;
}

export function createPoll(payload) {
  return request('/api/polls', { method: 'POST', body: payload });
}

export function fetchPoll(pollId) {
  return request(`/api/polls/${encodeURIComponent(pollId)}`);
}

export function fetchResults(pollId) {
  return request(`/api/polls/${encodeURIComponent(pollId)}/results`);
}

export function submitVote(pollId, optionIndex, { fingerprint } = {}) {
  return request(`/api/votes/${encodeURIComponent(pollId)}`, {
    method: 'POST',
    body: { option_index: optionIndex },
    fingerprint,
    pollId,
  });
}
