/**
 * Vote.jsx — Page vote temps réel
 * Responsable : Dev Frontend
 */
import VotePage from '../components/VotePage.jsx';
import Countdown from '../components/Countdown.jsx';

// TODO Dev : layout, socket subscription, états loading / erreur
export default function Vote() {
  return (
    <main>
      <h1>Voter</h1>
      <Countdown />
      <VotePage />
    </main>
  );
}
