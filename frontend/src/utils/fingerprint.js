/**
 * fingerprint.js — Génération d'empreinte navigateur RGPD-friendly
 * Responsable : Dev Frontend (sécurité)
 *
 * Combine UA, langue, fuseau, résolution et un hash canvas léger,
 * puis SHA-256 le tout pour obtenir un identifiant pseudonyme stable
 * sur le navigateur courant. Pas de tracking tiers, pas d'IP, pas de cookie.
 */

function getCanvasSignature() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 40);
    ctx.fillStyle = '#069';
    ctx.fillText('VoteChain.fp.0', 2, 2);
    return canvas.toDataURL();
  } catch {
    return 'canvas-unavailable';
  }
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getFingerprint() {
  const parts = [
    navigator.userAgent || 'ua-unknown',
    navigator.language || 'lang-unknown',
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'tz-unknown',
    `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    `${window.devicePixelRatio || 1}`,
    getCanvasSignature(),
  ];
  return sha256Hex(parts.join('|'));
}
