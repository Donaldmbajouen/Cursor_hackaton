/**
 * api.js — Client HTTP vers le backend FastAPI
 * Responsable : Dev Frontend
 */

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// TODO Dev : headers fingerprint / JWT (votes)

async function parseJsonResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(
      (data && data.detail) || res.statusText || 'Request failed',
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * @param {string} pollId
 * @returns {Promise<object>}
 */
export async function fetchPoll(pollId) {
  const res = await fetch(`${baseUrl}/api/polls/${encodeURIComponent(pollId)}`);
  return parseJsonResponse(res);
}

/**
 * @param {{ question: string, options: string[], closes_at: string }} body
 * closes_at: ISO 8601 (ex. new Date().toISOString())
 * @returns {Promise<object>}
 */
export async function createPoll(body) {
  const res = await fetch(`${baseUrl}/api/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

/**
 * @param {{ limit?: number, offset?: number }} [params]
 * @returns {Promise<{ items: object[], total: number, limit: number, offset: number }>}
 */
export async function listPolls(params = {}) {
  const q = new URLSearchParams();
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.offset != null) q.set('offset', String(params.offset));
  const query = q.toString();
  const res = await fetch(
    `${baseUrl}/api/polls${query ? `?${query}` : ''}`,
  );
  return parseJsonResponse(res);
}
