/**
 * Results.jsx — Résultats détaillés + temps réel
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Countdown from '../components/Countdown.jsx';
import ResultsChart from '../components/ResultsChart.jsx';
import ShareButton from '../components/ShareButton.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { getPoll } from '../services/api.js';

export default function Results() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [lastSync, setLastSync] = useState(() => Date.now());

  const { results, connected, totalVotes, retryCount } = useSocket(pollId);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      if (!pollId) return;
      setLoading(true);
      try {
        const p = await getPoll(pollId);
        if (!c) setPoll(p);
      } catch (e) {
        if (!c) setErr(e.message || 'Erreur');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [pollId]);

  const mergedResults = useMemo(() => {
    if (results && Object.keys(results).length) return results;
    return poll?.results || {};
  }, [results, poll]);

  const mergedTotal = useMemo(() => {
    const t = Object.values(mergedResults).reduce((a, b) => a + Number(b || 0), 0);
    if (t > 0) return t;
    return totalVotes;
  }, [mergedResults, totalVotes]);

  useEffect(() => {
    setLastSync(Date.now());
  }, [mergedResults]);

  const secsSince = Math.max(0, Math.floor((now - lastSync) / 1000));

  if (loading) {
    return (
      <div className="container-lg" style={{ padding: 48 }}>
        <div className="skeleton" style={{ height: 40, maxWidth: 400, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  if (err || !poll) {
    return (
      <div className="container" style={{ padding: 80, textAlign: 'center' }}>
        <p className="text-lg">{err || 'Introuvable'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Accueil
        </Link>
      </div>
    );
  }

  const closed = poll.is_open === false;

  return (
    <div className="container-lg" style={{ padding: '24px 0 48px' }}>
      {closed && (
        <div
          className="animate-slideDown"
          style={{
            padding: '12px 16px',
            background: 'var(--color-surface-alt)',
            borderLeft: '4px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          Ce sondage est clôturé · Les résultats sont définitifs
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <Link to={`/vote/${pollId}`} className="btn btn-ghost btn-sm">
          ← Retour au vote
        </Link>
        <span className={closed ? 'badge badge-warning' : 'badge badge-success'}>
          {closed ? 'Clôturé' : 'Ouvert'}
        </span>
      </div>

      <h1 className="text-2xl fw-700" style={{ marginBottom: 8 }}>
        Résultats — {poll.question}
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        {mergedTotal} participant{mergedTotal > 1 ? 's' : ''} · Mis à jour il y a {secsSince}s
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <span
          className={connected ? 'animate-pulse' : ''}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: connected ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        />
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {connected ? '🟢 En direct' : `🔴 Connexion perdue · Retry ${retryCount}`}
        </span>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <ResultsChart
          question={poll.question}
          options={poll.options}
          results={mergedResults}
          totalVotes={mergedTotal}
        />
      </div>

      <h2 className="text-lg fw-600" style={{ marginBottom: 12 }}>
        Détails
      </h2>
      <div className="card" style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '10px 8px' }}>Option</th>
              <th style={{ padding: '10px 8px' }}>Votes</th>
              <th style={{ padding: '10px 8px' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {poll.options.map((label, i) => {
              const c = Number(mergedResults[String(i)] ?? 0);
              const pct = mergedTotal ? Math.round((c / mergedTotal) * 1000) / 10 : 0;
              const barW = `${pct}%`;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 8px' }}>{label}</td>
                  <td style={{ padding: '12px 8px', minWidth: 180 }}>
                    <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {c} vote{c > 1 ? 's' : ''}
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: 'var(--color-surface-alt)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: barW,
                          height: '100%',
                          background: 'var(--color-primary)',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="text-sm fw-600" style={{ marginBottom: 8 }}>
          Clôture
        </h3>
        <Countdown closesAt={poll.closes_at} />
      </div>

      <ShareButton pollId={pollId} />
    </div>
  );
}
