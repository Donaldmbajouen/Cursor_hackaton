/**
 * token.js — Session locale et marqueur « a voté »
 */

const votedPrefix = 'votechain_voted_';
const sessionPrefix = 'votechain_session_';

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const hex = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

import { getSession } from '../services/api.js';

export async function getOrCreateSessionToken(pollId) {
  const key = `${sessionPrefix}${pollId}`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const data = await getSession(pollId);
  const token = data.session_token;
  localStorage.setItem(key, token);
  return token;
}

export function hasVoted(pollId) {
  return localStorage.getItem(`${votedPrefix}${pollId}`) === '1';
}

export function markVoted(pollId) {
  localStorage.setItem(`${votedPrefix}${pollId}`, '1');
}
