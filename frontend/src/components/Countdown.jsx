/**
 * Countdown.jsx — Compte à rebours jusqu'à closesAt
 * Responsable : Dev Frontend
 */
import { useEffect, useRef, useState } from 'react';

function format(deltaMs) {
  if (deltaMs <= 0) return 'Clôturé';
  const totalSeconds = Math.floor(deltaMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (days > 0) return `${days}j ${pad(hours)}:${pad(minutes)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function Countdown({ closesAt, onEnd, className = '' }) {
  const target = closesAt ? new Date(closesAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    endedRef.current = false;
    if (!target) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    if (!endedRef.current && now >= target) {
      endedRef.current = true;
      onEnd?.();
    }
  }, [now, target, onEnd]);

  if (!target) {
    return <span className={`text-slate-500 ${className}`}>--:--</span>;
  }

  const delta = target - now;
  const isClosed = delta <= 0;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        isClosed ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'
      } ${className}`}
      aria-live="polite"
    >
      <span aria-hidden="true">{isClosed ? '⏱' : '⏳'}</span>
      <span>{format(delta)}</span>
    </span>
  );
}
