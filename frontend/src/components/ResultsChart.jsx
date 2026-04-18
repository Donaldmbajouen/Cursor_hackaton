/**
 * ResultsChart.jsx — Barres + camembert (Recharts)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function buildRows(options, results) {
  const total = options.reduce(
    (acc, _, i) => acc + Number(results?.[String(i)] ?? 0),
    0,
  );
  return options.map((name, i) => {
    const count = Number(results?.[String(i)] ?? 0);
    const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return { name, count, pct, index: i };
  });
}

export default function ResultsChart({
  options,
  results,
  totalVotes,
  animated = true,
  question = '',
  compact = false,
}) {
  const [tab, setTab] = useState('bars');
  const [barPct, setBarPct] = useState({});
  const [now, setNow] = useState(() => Date.now());
  const lastResultsAt = useRef(Date.now());

  useEffect(() => {
    lastResultsAt.current = Date.now();
  }, [results]);

  const rows = useMemo(() => buildRows(options, results), [options, results]);
  const maxPct = useMemo(() => Math.max(0, ...rows.map((r) => r.pct)), [rows]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const next = {};
    rows.forEach((r) => {
      next[r.index] = 0;
    });
    setBarPct(next);
    const t = window.requestAnimationFrame(() => {
      const end = {};
      rows.forEach((r) => {
        end[r.index] = r.pct;
      });
      setBarPct(end);
    });
    return () => cancelAnimationFrame(t);
  }, [rows]);

  const pieData = useMemo(
    () =>
      rows.map((r, i) => ({
        name: r.name,
        value: r.count,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })),
    [rows],
  );

  const emptyVotes = totalVotes === 0;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={tab === 'bars' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setTab('bars')}
        >
          Barres
        </button>
        <button
          type="button"
          className={tab === 'pie' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          onClick={() => setTab('pie')}
        >
          Camembert
        </button>
      </div>

      {tab === 'bars' && (
        <div
          key="bars"
          className="animate-fadeIn"
          style={{ animationDuration: '0.2s' }}
        >
          {!compact && question && (
            <div
              className="text-base fw-600"
              style={{ marginBottom: 12, color: 'var(--color-text-primary)' }}
            >
              {question}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {' '}
                · {totalVotes} votes au total
              </span>
            </div>
          )}
          {compact && (
            <div className="text-sm fw-600" style={{ marginBottom: 8 }}>
              {totalVotes} votes
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((r) => {
              const leader = r.pct === maxPct && maxPct > 0;
              const w = animated ? barPct[r.index] ?? r.pct : r.pct;
              return (
                <div key={r.index}>
                  <div
                    className="text-sm fw-500"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span>{r.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {r.pct}% · {r.count} votes
                    </span>
                  </div>
                  <div
                    style={{
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-alt)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${w}%`,
                        maxWidth: '100%',
                        borderRadius: 'var(--radius-md)',
                        transition: 'width 0.8s ease-out',
                        background: leader
                          ? 'linear-gradient(90deg, #10B981, #059669)'
                          : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
            Dernière mise à jour : il y a{' '}
            {Math.max(0, Math.floor((now - lastResultsAt.current) / 1000))}s
          </p>
        </div>
      )}

      {tab === 'pie' && (
        <div
          key="pie"
          className="animate-fadeIn"
          style={{ animationDuration: '0.2s', textAlign: 'center' }}
        >
          {emptyVotes ? (
            <div
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              <div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[{ name: '—', value: 1 }]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#e2e8f0"
                      isAnimationActive={animated}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-sm">Aucun vote pour l&apos;instant</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  isAnimationActive={animated}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color || PIE_COLORS[index % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(value, name) => [`${value} votes`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
