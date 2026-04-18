/**
 * useSocket.js — WebSocket résultats temps réel
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

const MAX_RETRIES = 5;
const RETRY_MS = 3000;
const PING_MS = 25000;

function sumResults(results) {
  if (!results || typeof results !== 'object') return 0;
  return Object.values(results).reduce((a, b) => a + Number(b || 0), 0);
}

export function useSocket(pollId) {
  const [results, setResults] = useState(null);
  const [connected, setConnected] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const wsRef = useRef(null);
  const pingRef = useRef(null);
  const retryRef = useRef(null);
  const attemptsRef = useRef(0);
  const pollIdRef = useRef(pollId);
  const mountedRef = useRef(true);

  pollIdRef.current = pollId;

  const connect = useCallback(() => {
    if (!pollId) return;
    const url = `${WS_URL.replace(/\/$/, '')}/ws/votes/${pollId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      attemptsRef.current = 0;
      setRetryCount(0);
      pingRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send('ping');
          } catch (e) {
            console.warn('[VoteChain] ping', e);
          }
        }
      }, PING_MS);
    };

    ws.onmessage = (ev) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(ev.data);
        if (
          data.type === 'results:init' ||
          data.type === 'results:update'
        ) {
          const r = data.results || {};
          setResults(r);
          setTotalVotes(sumResults(r));
        }
      } catch {
        /* ignore non-json */
      }
    };

    ws.onerror = () => {
      console.warn('[VoteChain] WebSocket error');
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
      if (!pollIdRef.current) return;
      attemptsRef.current += 1;
      setRetryCount(attemptsRef.current);
      if (attemptsRef.current <= MAX_RETRIES) {
        retryRef.current = window.setTimeout(() => {
          if (mountedRef.current && pollIdRef.current) connect();
        }, RETRY_MS);
      }
    };
  }, [pollId]);

  useEffect(() => {
    mountedRef.current = true;
    attemptsRef.current = 0;
    setRetryCount(0);
    setResults(null);
    setTotalVotes(0);
    if (!pollId) {
      setConnected(false);
      return undefined;
    }
    connect();
    return () => {
      mountedRef.current = false;
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [pollId, connect]);

  return { results, connected, totalVotes, retryCount };
}
