/**
 * Dashboard.jsx — Espace créateur (stats + sondages)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useMyPolls from '../hooks/useMyPolls.js';

function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

function StatCard({ label, value, accent }) {
  return (
    <motion.div
      className="card stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ? 'stat-value-accent' : ''}`}>{value}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { polls, stats, loading, error, remove, reload } = useMyPolls();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleDelete = async (poll) => {
    setActionError('');
    try {
      await remove(poll.id);
      setPendingDelete(null);
    } catch (e) {
      setActionError(e.message || 'Suppression impossible');
    }
  };

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container-lg">
        <div className="dashboard-head">
          <div>
            <h1 className="text-2xl fw-700">
              Bonjour {user?.name || user?.email?.split('@')[0] || ''} 👋
            </h1>
            <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Voici un aperçu de vos sondages et de leur activité.
            </p>
          </div>
          <Link to="/create" className="btn btn-primary">
            + Nouveau sondage
          </Link>
        </div>

        {error && (
          <div
            className="badge badge-danger"
            style={{ display: 'inline-block', marginTop: 12 }}
          >
            {error}
          </div>
        )}

        <div className="dashboard-stats">
          <StatCard label="Sondages créés" value={stats?.polls_count ?? (loading ? '…' : 0)} />
          <StatCard label="Votes cumulés" value={stats?.total_votes ?? (loading ? '…' : 0)} accent />
          <StatCard label="Sondages actifs" value={stats?.active_polls ?? (loading ? '…' : 0)} />
          <StatCard label="Sondages clos" value={stats?.closed_polls ?? (loading ? '…' : 0)} />
        </div>

        {stats?.top_poll && (
          <motion.div
            className="card top-poll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div>
              <span className="text-xs fw-600" style={{ color: 'var(--color-primary)' }}>
                ⭐ Top sondage
              </span>
              <h3 className="text-lg fw-700" style={{ marginTop: 4 }}>
                {stats.top_poll.question}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {stats.top_poll.total_votes} vote{stats.top_poll.total_votes > 1 ? 's' : ''}
              </p>
            </div>
            <Link to={`/results/${stats.top_poll.id}`} className="btn btn-outline btn-sm">
              Voir les résultats
            </Link>
          </motion.div>
        )}

        <div className="dashboard-list-head">
          <h2 className="text-xl fw-700">Mes sondages</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={reload}
            disabled={loading}
          >
            ↻ Rafraîchir
          </button>
        </div>

        {loading && polls.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Chargement de vos sondages…
          </div>
        ) : polls.length === 0 ? (
          <div className="card empty-state">
            <span className="text-3xl" aria-hidden>📭</span>
            <h3 className="text-lg fw-700" style={{ marginTop: 12 }}>
              Aucun sondage pour le moment
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
              Lancez votre premier vote en quelques secondes.
            </p>
            <Link to="/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              Créer un sondage
            </Link>
          </div>
        ) : (
          <div className="poll-list">
            {polls.map((poll, i) => {
              const closingLabel = poll.is_open ? 'Ferme le' : 'Fermé le';
              return (
                <motion.div
                  key={poll.id}
                  className="card poll-row"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <div className="poll-row-main">
                    <div className="poll-row-meta">
                      <span
                        className={`badge ${poll.is_open ? 'badge-success' : 'badge-danger'}`}
                      >
                        {poll.is_open ? 'Ouvert' : 'Clos'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Créé le {formatDate(poll.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg fw-700 poll-row-question">{poll.question}</h3>
                    <div className="poll-row-stats">
                      <span>
                        <strong>{poll.total_votes}</strong> vote{poll.total_votes > 1 ? 's' : ''}
                      </span>
                      <span>{poll.options_count} options</span>
                      <span>
                        {closingLabel} {formatDate(poll.closes_at)}
                      </span>
                    </div>
                  </div>
                  <div className="poll-row-actions">
                    <Link to={`/results/${poll.id}`} className="btn btn-outline btn-sm">
                      Résultats
                    </Link>
                    <Link to={`/vote/${poll.id}`} className="btn btn-ghost btn-sm">
                      Vue publique
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost-danger btn-sm"
                      onClick={() => setPendingDelete(poll)}
                    >
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {pendingDelete && (
        <div
          className="modal-backdrop animate-fadeIn"
          onClick={() => setPendingDelete(null)}
          onKeyDown={(e) => e.key === 'Escape' && setPendingDelete(null)}
          role="presentation"
        >
          <div
            className="card modal-card animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-lg fw-700">Supprimer ce sondage ?</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
              Cette action est définitive. Les votes associés seront également supprimés.
            </p>
            <p
              className="text-sm"
              style={{ marginTop: 12, fontStyle: 'italic', color: 'var(--color-text-primary)' }}
            >
              « {pendingDelete.question} »
            </p>
            {actionError && (
              <div className="error-text" style={{ marginTop: 8 }} role="alert">
                {actionError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => handleDelete(pendingDelete)}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setPendingDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
