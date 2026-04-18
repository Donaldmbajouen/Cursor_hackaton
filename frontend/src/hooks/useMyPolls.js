/**
 * useMyPolls — Récupère les sondages et stats de l'utilisateur courant
 */
import { useCallback, useEffect, useState } from 'react';
import { deleteMyPoll, fetchMyPolls, fetchMyStats } from '../services/api.js';

export default function useMyPolls() {
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pollsRes, statsRes] = await Promise.all([fetchMyPolls(), fetchMyStats()]);
      setPolls(pollsRes?.polls || []);
      setStats(statsRes || null);
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (pollId) => {
      await deleteMyPoll(pollId);
      await load();
    },
    [load],
  );

  return { polls, stats, loading, error, reload: load, remove };
}
