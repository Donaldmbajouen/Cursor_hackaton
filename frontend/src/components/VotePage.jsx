/**
 * VotePage.jsx — Choix d’option et confirmation
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function VotePage({
  poll,
  onVote,
  loading,
  hasVoted,
  sessionToken: _sessionToken,
  connected,
  votedFor,
  pollClosed = false,
}) {
  _sessionToken;
  const [selected, setSelected] = useState(null);
  const opts = poll?.options || [];

  if (pollClosed && !hasVoted) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="text-2xl" style={{ marginBottom: 12 }}>
          🔒
        </div>
        <h2 className="text-xl fw-700" style={{ marginBottom: 8 }}>
          Sondage clôturé
        </h2>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Les votes ne sont plus acceptés. Consultez les résultats.
        </p>
        <Link to={`/results/${poll.id}`} className="btn btn-primary">
          Voir les résultats →
        </Link>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="card animate-slideUp" style={{ textAlign: 'center' }}>
        <div className="text-2xl" style={{ marginBottom: 12 }}>
          ✅
        </div>
        <h2 className="text-xl fw-700" style={{ marginBottom: 8 }}>
          Votre vote a été enregistré
        </h2>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Vous avez voté pour :{' '}
          <span className="fw-600" style={{ color: 'var(--color-primary)' }}>
            {votedFor || '—'}
          </span>
        </p>
        <Link to={`/results/${poll.id}`} className="btn btn-primary">
          Voir les résultats →
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        />
        {connected ? 'En direct' : 'Reconnexion…'}
      </div>

      <h1 className="text-xl fw-700" style={{ marginBottom: 8, paddingRight: 100 }}>
        📊 {poll.question}
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        <span className="badge badge-success">● Ouvert</span>
        <span style={{ marginLeft: 8 }}>{opts.length} options</span>
      </p>

      <p className="label" style={{ marginBottom: 12 }}>
        Choisissez votre réponse
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((label, i) => {
          const sel = selected === i;
          return (
            <button
              key={i}
              type="button"
              className="animate-slideUp"
              style={{
                animationDelay: `${i * 60}ms`,
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: sel ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: sel ? 'var(--color-primary-light)' : 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 16,
                fontFamily: 'inherit',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!sel) {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!sel) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-surface)';
                }
              }}
              onClick={() => setSelected(i)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid var(--color-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: sel ? 'var(--color-primary)' : 'transparent',
                  }}
                >
                  {sel && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </span>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: 24 }}
        disabled={loading || selected == null}
        onClick={() => onVote(selected)}
      >
        {loading ? 'Envoi…' : 'Voter maintenant →'}
      </button>

      <p
        className="text-xs"
        style={{ color: 'var(--color-text-muted)', marginTop: 20, textAlign: 'center' }}
      >
        🔒 Un seul vote par appareil · Anti-fraude activé
      </p>
    </div>
  );
}
