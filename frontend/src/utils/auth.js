/**
 * auth.js — Stockage du JWT utilisateur (localStorage)
 */
const TOKEN_KEY = 'votechain_user_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}
