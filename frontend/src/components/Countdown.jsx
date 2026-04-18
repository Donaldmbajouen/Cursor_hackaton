/**
 * Countdown.jsx — Décompte jusqu'à la clôture
 */
import { useEffect, useMemo, useRef, useState } from 'react';

function parseIso(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function splitDiff(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, total };
}

export default function Countdown({ closesAt, onExpire }) {
  const [now, setNow] = useState(() => Date.now());
  const expiredCalled = useRef(false);

  const end = useMemo(() => parseIso(closesAt), [closesAt]);
  const diff = end ? end.getTime() - now : 0;
  const parts = splitDiff(diff);
  const expired = end && diff <= 0;
  const lessThanHour = !expired && diff > 0 && diff < 3600 * 1000;

  useEffect(() => {
    if (!expired || !onExpire || expiredCalled.current) return;
    expiredCalled.current = true;
    onExpire();
  }, [expired, onExpire]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!closesAt || !end) {
    return null;
  }

  if (expired) {
    return (
      <div className="animate-fadeIn" style={{ marginTop: 16 }}>
        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: 8 }}>
          <span>🔒</span>
          <span>Sondage clôturé</span>
        </span>
      </div>
    );
  }

  const digitColor = lessThanHour ? 'var(--color-danger)' : 'var(--color-primary)';
  const showSeconds = lessThanHour;

  const block = (value, label, key) => (
    <div
      key={key}
      className="animate-countUp"
      style={{
        background: 'var(--color-surface-alt)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        textAlign: 'center',
        minWidth: 72,
      }}
    >
      <div
        className="text-2xl fw-700"
        style={{ color: digitColor, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {block(parts.days, 'jours', 'd')}
        <span className="text-2xl fw-700" style={{ color: digitColor }}>
          :
        </span>
        {block(parts.hours, 'heures', 'h')}
        <span className="text-2xl fw-700" style={{ color: digitColor }}>
          :
        </span>
        {block(parts.minutes, 'minutes', 'm')}
        {showSeconds && (
          <>
            <span className="text-2xl fw-700" style={{ color: digitColor }}>
              :
            </span>
            {block(parts.seconds, 'secondes', 's')}
          </>
        )}
      </div>
      {lessThanHour && (
        <div
          className="badge badge-danger animate-pulse"
          style={{ marginTop: 12, display: 'inline-flex' }}
        >
          Moins d&apos;une heure
        </div>
      )}
    </div>
  );
}
