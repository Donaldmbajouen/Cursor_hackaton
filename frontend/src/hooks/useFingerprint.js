/**
 * useFingerprint.js — Empreinte navigateur pour anti-fraude
 * Responsable : Dev Frontend (sécurité)
 */
import { useEffect, useState } from 'react';
import { getFingerprint } from '../utils/fingerprint.js';

// TODO Dev : cache localStorage, rotation, privacy notice
export function useFingerprint() {
  const [fp, setFp] = useState(null);

  useEffect(() => {
    void getFingerprint;
    // TODO : setFp(await getFingerprint())
  }, []);

  return fp;
}
