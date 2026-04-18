/**
 * Results.jsx — Page résultats temps réel
 * Responsable : Dev Frontend
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Countdown from '../components/Countdown.jsx';
import ResultsChart from '../components/ResultsChart.jsx';
import ShareButton from '../components/ShareButton.jsx';
import { useVoteWebSocket } from '../hooks/useSocket.js';
import { ApiError, fetchPoll, fetchResults } from '../services/api.js';

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

function normalizeCounts(rawResults, optionsLength) {
  const counts = new Array(optionsLength).fill(0);
  if (!rawResults) return counts;
  if (Array.isArray(rawResults.counts)) {
    rawResults.counts.forEach((value, index) => {
      if (index < counts.length) counts[index] = Number(value) || 0;
    });
    return counts;
  }
  if (Array.isArray(rawResults.results)) {
    rawResults.results.forEach((entry) => {
      const index = entry.option_index ?? entry.index;
      const value = entry.count ?? entry.value ?? 0;
      if (index != null && index < counts.length) counts[index] = Number(value) || 0;
    });
    return counts;
  }
  if (typeof rawResults === 'object') {
    Object.entries(rawResults).forEach(([key, value]) => {
      const index = Number(key);
      if (Number.isInteger(index) && index < counts.length) {
        counts[index] = Number(value) || 0;
      }
    });
  }
  return counts;
}

const READY_STATE_LABELS = {
  0: { label: 'Connexion…', color: 'bg-amber-400' },
  1: { label: 'Temps réel actif', color: 'bg-emerald-500' },
  2: { label: 'Fermeture…', color: 'bg-amber-400' },
  3: { label: 'Hors ligne', color: 'bg-slate-400' },
};

export default function Results() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lastMessage, readyState } = useVoteWebSocket(pollId);

  useEffect(() => {
    if (!pollId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [pollData, resultsData] = await Promise.all([
          fetchPoll(pollId),
          fetchResults(pollId).catch(() => null),
        ]);
        if (cancelled) return;
        setPoll(pollData);
        const opts = parseOptions(pollData?.options);
        setCounts(normalizeCounts(resultsData, opts.length));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Sondage introuvable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const options = useMemo(() => parseOptions(poll?.options), [poll]);

  useEffect(() => {
    if (lastMessage == null || options.length === 0) return;
    let payload;
    try {
      payload = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
    } catch {
      return;
    }
    setCounts((prev) => {
      const next = prev.length === options.length ? [...prev] : new Array(options.length).fill(0);
      if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.counts)) {
          payload.counts.forEach((value, index) => {
            if (index < next.length) next[index] = Number(value) || 0;
          });
          return next;
        }
        const idx = payload.option_index ?? payload.index;
        if (idx != null && idx < next.length) {
          if (payload.count != null) next[idx] = Number(payload.count) || 0;
          else next[idx] = (next[idx] || 0) + 1;
          return next;
        }
      }
      return prev;
    });
  }, [lastMessage, options.length]);

  const chartData = useMemo(
    () =>
      options.map((label, index) => ({
        name: label,
        value: counts[index] || 0,
      })),
    [options, counts]
  );

  const totalVotes = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.value, 0),
    [chartData]
  );

  const status = READY_STATE_LABELS[readyState] || READY_STATE_LABELS[3];

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" label="Chargement des résultats" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert variant="error" title="Erreur">{error}</Alert>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{poll?.question}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalVotes} vote{totalVotes > 1 ? 's' : ''} · clôture le{' '}
              {poll?.closes_at ? new Date(poll.closes_at).toLocaleString() : '—'}
            </p>
          </div>
          <Countdown closesAt={poll?.closes_at} />
        </header>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${status.color}`} aria-hidden="true" />
          {status.label}
        </div>

        <ResultsChart data={chartData} />

        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {chartData.map((entry, index) => {
            const pct = totalVotes > 0 ? Math.round((entry.value / totalVotes) * 100) : 0;
            return (
              <li key={index} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{entry.name}</span>
                <span className="text-slate-500">
                  {entry.value} vote{entry.value > 1 ? 's' : ''} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ShareButton
            url={
              typeof window !== 'undefined'
                ? `${window.location.origin}/vote/${encodeURIComponent(pollId)}`
                : undefined
            }
          />
          <a
            href={`/vote/${encodeURIComponent(pollId)}`}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Aller à la page de vote →
          </a>
        </div>
      </div>
    </Card>
  );
}
