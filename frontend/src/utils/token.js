/**
 * token.js — Stockage / lecture de tokens (localStorage namespacé)
 * Responsable : Dev Frontend (sécurité)
 */

const NAMESPACE = 'votechain';

function buildKey(kind, scope) {
  return scope ? `${NAMESPACE}:${kind}:${scope}` : `${NAMESPACE}:${kind}`;
}

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveToken(kind, scope, value) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(buildKey(kind, scope), JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function readToken(kind, scope) {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(buildKey(kind, scope));
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearToken(kind, scope) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(buildKey(kind, scope));
  } catch {
    /* noop */
  }
}
