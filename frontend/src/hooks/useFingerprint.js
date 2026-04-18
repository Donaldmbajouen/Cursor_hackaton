/**
 * useFingerprint.js — Empreinte navigateur
 */
import { useEffect, useState } from 'react';
import { getFingerprint } from '../utils/fingerprint.js';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState('');
  const [screenRes, setScreenRes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getFingerprint();
        if (!cancelled) {
          setFingerprint(r.fingerprint);
          setScreenRes(r.screenRes);
        }
      } catch (e) {
        console.warn('[VoteChain] getFingerprint', e);
        if (!cancelled) {
          setFingerprint('');
          setScreenRes('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { fingerprint, screenRes, loading };
}
