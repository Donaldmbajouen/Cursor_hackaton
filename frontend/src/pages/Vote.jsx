/**
 * Vote.jsx — Page vote + résultats live
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Countdown from '../components/Countdown.jsx';
import ResultsChart from '../components/ResultsChart.jsx';
import ShareButton from '../components/ShareButton.jsx';
import VotePage from '../components/VotePage.jsx';
import { useFingerprint } from '../hooks/useFingerprint.js';
import { useSocket } from '../hooks/useSocket.js';
import { castVote, getPoll } from '../services/api.js';
import { getOrCreateSessionToken, hasVoted, markVoted } from '../utils/token.js';

export default function Vote() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loadingPoll, setLoadingPoll] = useState(true);
  const [sessionToken, setSessionToken] = useState('');
  const [voted, setVoted] = useState(false);
  const [votedFor, setVotedFor] = useState('');
  const [voteLoading, setVoteLoading] = useState(false);
  const [toast, setToast] = useState('');

  const { fingerprint, screenRes, loading: fpLoading } = useFingerprint();
  const { results, connected, totalVotes, retryCount } = useSocket(pollId);

  const mergedResults = useMemo(() => {
    if (results && typeof results === 'object') return results;
    if (poll?.results) return poll.results;
    return {};
  }, [results, poll]);

  const mergedTotal = useMemo(() => {
    if (totalVotes > 0) return totalVotes;
    return Object.values(mergedResults).reduce((a, b) => a + Number(b || 0), 0);
  }, [totalVotes, mergedResults]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pollId) return;
      setLoadingPoll(true);
      setLoadError('');
      try {
        const p = await getPoll(pollId);
        if (!cancelled) {
          setPoll(p);
          setVoted(hasVoted(pollId));
        }
        const tok = await getOrCreateSessionToken(pollId);
        if (!cancelled) setSessionToken(tok);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Erreur');
      } finally {
        if (!cancelled) setLoadingPoll(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const handleVote = useCallback(
    async (optionIndex) => {
      if (!pollId || fpLoading) return;
      setVoteLoading(true);
      try {
        await castVote(pollId, {
          option_index: optionIndex,
          session_token: sessionToken,
          fingerprint: fingerprint || undefined,
          screen_res: screenRes || undefined,
        });
        markVoted(pollId);
        setVoted(true);
        setVotedFor(poll.options[optionIndex] || '');
      } catch (e) {
        setToast(e.message || 'Erreur');
      } finally {
        setVoteLoading(false);
      }
    },
    [pollId, poll, sessionToken, fingerprint, screenRes, fpLoading],
  );

  if (loadingPoll) {
    return (
      <div className="container-lg" style={{ padding: '48px 0' }}>
        <div className="grid-vote">
          <div>
            <div className="skeleton" style={{ height: 200, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 48, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
          <div>
            <div className="skeleton" style={{ height: 280 }} />
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !poll) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1 className="text-2xl fw-700" style={{ marginBottom: 12 }}>
          Sondage introuvable
        </h1>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          {loadError || 'Ce lien ne correspond à aucun sondage actif.'}
        </p>
        <Link to="/" className="btn btn-primary">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const open = poll.is_open !== false;

  return (
    <div className="container-lg" style={{ padding: '24px 0 48px' }}>
      {toast && <div className="toast-error">{toast}</div>}

      <div className="grid-vote">
        <div>
          <VotePage
            poll={poll}
            onVote={handleVote}
            loading={voteLoading || fpLoading}
            hasVoted={voted}
            sessionToken={sessionToken}
            connected={connected}
            votedFor={votedFor}
            pollClosed={!open}
          />
          {open && (
            <div style={{ marginTop: 24 }} className="card">
              <h3 className="text-sm fw-600" style={{ marginBottom: 8 }}>
                Clôture
              </h3>
              <Countdown closesAt={poll.closes_at} />
            </div>
          )}
        </div>

        <div className="card animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 className="text-lg fw-700">Résultats en direct</h2>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {connected ? '🟢 En direct' : `Reconnexion… (${retryCount})`}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            {mergedTotal} vote{mergedTotal > 1 ? 's' : ''}
          </p>
          <ResultsChart
            compact
            question={poll.question}
            options={poll.options}
            results={mergedResults}
            totalVotes={mergedTotal}
          />
          <div style={{ marginTop: 20 }}>
            <ShareButton pollId={pollId} label="Partager le vote" />
          </div>
        </div>
      </div>
    </div>
  );
}
