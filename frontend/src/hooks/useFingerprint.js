/**
 * useFingerprint.js — Empreinte navigateur pour anti-fraude
 * Responsable : Dev Frontend (sécurité)
 */
import { useEffect, useState } from 'react';
import { getFingerprint } from '../utils/fingerprint.js';
import { readToken, saveToken } from '../utils/token.js';

const FP_KIND = 'fp';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState(() => readToken(FP_KIND, 'self'));
  const [ready, setReady] = useState(Boolean(readToken(FP_KIND, 'self')));

  useEffect(() => {
    let cancelled = false;
    if (fingerprint) {
      setReady(true);
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const value = await getFingerprint();
        if (cancelled) return;
        saveToken(FP_KIND, 'self', value);
        setFingerprint(value);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fingerprint]);

  return { fingerprint, ready };
}
