/**
 * VotePage.jsx — UI de vote (sélection d’option)
 * Responsable : Dev Frontend
 */
import { useParams } from 'react-router-dom';

// TODO Dev : charger le sondage, émettre vote via API ou socket
export default function VotePage() {
  const { pollId } = useParams();
  return <div>Vote — pollId: {pollId} {/* TODO */}</div>;
}
