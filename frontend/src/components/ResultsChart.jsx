/**
 * ResultsChart.jsx — Graphique Recharts des résultats
 * Responsable : Dev Frontend
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function ResultsChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
        Aucun vote pour le moment.
      </div>
    );
  }

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label="Graphique en barres des résultats du sondage"
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Bar dataKey="value" name="Votes" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
