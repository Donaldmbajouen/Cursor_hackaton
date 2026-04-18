/**
 * CreatePoll.jsx — Page création de sondage
 * Responsable : Dev Frontend
 */
import Card from '../components/ui/Card.jsx';
import PollForm from '../components/PollForm.jsx';

export default function CreatePoll() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Créer un sondage</h1>
        <p className="mt-1 text-sm text-slate-600">
          Définissez votre question, ajoutez des options et fixez une date de clôture.
          Vous obtiendrez un lien unique à partager.
        </p>
      </header>
      <Card>
        <PollForm />
      </Card>
    </div>
  );
}
