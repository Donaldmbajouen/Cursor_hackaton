/**
 * VotePage.jsx — UI de vote (sélection d'option + soumission)
 * Responsable : Dev Frontend
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, fetchPoll, submitVote } from '../services/api.js';
import { useFingerprint } from '../hooks/useFingerprint.js';
import { readToken, saveToken } from '../utils/token.js';
import Alert from './ui/Alert.jsx';
import Button from './ui/Button.jsx';
import Spinner from './ui/Spinner.jsx';
import Countdown from './Countdown.jsx';
import ShareButton from './ShareButton.jsx';

function parseOptions(rawOptions) {
  if (Array.isArray(rawOptions)) return rawOptions;
  if (typeof rawOptions === 'string') {
    try {
      const parsed = JSON.parse(rawOptions);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return rawOptions.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

const STATUS = {
  loading: 'loading',
  ready: 'ready',
  closed: 'closed',
  alreadyVoted: 'already_voted',
  error: 'error',
};

export default function VotePage() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { fingerprint } = useFingerprint();
  const [poll, setPoll] = useState(null);
  const [status, setStatus] = useState(STATUS.loading);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    let cancelled = false;
    setStatus(STATUS.loading);
    setError(null);
    (async () => {
      try {
        const data = await fetchPoll(pollId);
        if (cancelled) return;
        setPoll(data);
        const closed = data?.closes_at && new Date(data.closes_at).getTime() <= Date.now();
        if (closed) {
          setStatus(STATUS.closed);
        } else if (readToken('vote', pollId)) {
          setStatus(STATUS.alreadyVoted);
        } else {
          setStatus(STATUS.ready);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Sondage introuvable.');
        setStatus(STATUS.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const options = useMemo(() => parseOptions(poll?.options), [poll]);

  function handleClosed() {
    setStatus((prev) => (prev === STATUS.ready ? STATUS.closed : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (selected == null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitVote(pollId, selected, { fingerprint });
      saveToken('vote', pollId, { option_index: selected, at: new Date().toISOString() });
      navigate(`/results/${encodeURIComponent(pollId)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        saveToken('vote', pollId, { duplicate: true, at: new Date().toISOString() });
        setStatus(STATUS.alreadyVoted);
      } else if (err instanceof ApiError && err.status === 410) {
        setStatus(STATUS.closed);
      } else {
        setError(err instanceof ApiError ? err.message : "Échec de l'envoi du vote.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (status === STATUS.loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="lg" label="Chargement du sondage" />
      </div>
    );
  }

  if (status === STATUS.error) {
    return <Alert variant="error" title="Erreur">{error || 'Sondage introuvable.'}</Alert>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{poll?.question}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {options.length} options · clôture le{' '}
            {poll?.closes_at ? new Date(poll.closes_at).toLocaleString() : '—'}
          </p>
        </div>
        <Countdown closesAt={poll?.closes_at} onEnd={handleClosed} />
      </header>

      {status === STATUS.alreadyVoted && (
        <Alert variant="info" title="Vous avez déjà voté">
          Merci pour votre participation. Consultez les résultats en direct.
        </Alert>
      )}

      {status === STATUS.closed && (
        <Alert variant="warning" title="Sondage clôturé">
          Le vote n'est plus possible. Les résultats restent consultables.
        </Alert>
      )}

      {status === STATUS.ready && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="sr-only">Choisissez une option</legend>
            {options.map((label, index) => {
              const checked = selected === index;
              return (
                <label
                  key={index}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    checked
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="vote-option"
                    value={index}
                    checked={checked}
                    onChange={() => setSelected(index)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-slate-800">{label}</span>
                </label>
              );
            })}
          </fieldset>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ShareButton />
            <Button type="submit" loading={submitting} disabled={selected == null}>
              Envoyer mon vote
            </Button>
          </div>
        </form>
      )}

      {status !== STATUS.ready && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ShareButton />
          <Button
            variant="secondary"
            onClick={() => navigate(`/results/${encodeURIComponent(pollId)}`)}
          >
            Voir les résultats
          </Button>
        </div>
      )}
    </div>
  );
}
