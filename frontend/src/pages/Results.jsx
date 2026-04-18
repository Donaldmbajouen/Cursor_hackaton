/**
 * Results.jsx — Page résultats + graphique
 * Responsable : Dev Frontend
 */
import { useParams } from 'react-router-dom';
import ResultsChart from '../components/ResultsChart.jsx';
import ShareButton from '../components/ShareButton.jsx';

// TODO Dev : fetch agrégats, live updates via socket
export default function Results() {
  const { pollId } = useParams();
  return (
    <main>
      <h1>Résultats — {pollId}</h1>
      <ShareButton />
      <ResultsChart data={[]} />
    </main>
  );
}
