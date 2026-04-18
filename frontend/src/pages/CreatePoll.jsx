/**
 * CreatePoll.jsx — Page création de sondage
 * Responsable : Dev Frontend
 */
import PollForm from '../components/PollForm.jsx';

// TODO Dev : en-tête, redirection après création, gestion erreurs
export default function CreatePoll() {
  return (
    <main>
      <h1>Créer un sondage</h1>
      <PollForm />
    </main>
  );
}
