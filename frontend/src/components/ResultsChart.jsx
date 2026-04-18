/**
 * ResultsChart.jsx — Graphique Recharts des résultats
 * Responsable : Dev Frontend
 */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// TODO Dev : props data, labels dynamiques, accessibilité
export default function ResultsChart({ data = [] }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
