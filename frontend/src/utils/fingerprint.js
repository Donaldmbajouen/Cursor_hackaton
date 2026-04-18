/**
 * fingerprint.js — Empreinte navigateur (SHA-256)
 */

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getFingerprint() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const language = typeof navigator !== 'undefined' ? navigator.language : '';
  const screenRes =
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '0x0';
  const cores =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency != null
      ? String(navigator.hardwareConcurrency)
      : 'unknown';
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
      : 'unknown';

  const raw = [ua, language, screenRes, cores, tz].join('|');

  if (
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof TextEncoder !== 'undefined'
  ) {
    try {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(raw),
      );
      return {
        fingerprint: bufferToHex(digest),
        screenRes,
      };
    } catch (e) {
      console.warn('[VoteChain] SubtleCrypto digest failed', e);
    }
  }

  return {
    fingerprint: generateUUID(),
    screenRes,
  };
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
