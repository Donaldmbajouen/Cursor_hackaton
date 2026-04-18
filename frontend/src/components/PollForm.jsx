/**
 * PollForm.jsx — Formulaire création de sondage
 * Responsable : Dev Frontend
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createPoll } from '../services/api.js';
import { saveToken } from '../utils/token.js';
import Alert from './ui/Alert.jsx';
import Button from './ui/Button.jsx';

const MAX_QUESTION = 200;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

function defaultClosesAt() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PollForm() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closesAt, setClosesAt] = useState(defaultClosesAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trimmedOptions = useMemo(
    () => options.map((o) => o.trim()).filter((o) => o.length > 0),
    [options]
  );

  const isValid =
    question.trim().length > 0 &&
    question.trim().length <= MAX_QUESTION &&
    trimmedOptions.length >= MIN_OPTIONS &&
    closesAt &&
    new Date(closesAt).getTime() > Date.now();

  function updateOption(index, value) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, ''] : prev));
  }

  function removeOption(index) {
    setOptions((prev) => (prev.length > MIN_OPTIONS ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        question: question.trim(),
        options: trimmedOptions,
        closes_at: new Date(closesAt).toISOString(),
      };
      const response = await createPoll(payload);
      const pollId = response?.id || response?.poll_id;
      if (!pollId) {
        throw new ApiError(500, "Réponse invalide de l'API (id manquant)");
      }
      if (response?.creator_token) {
        saveToken('token', pollId, response.creator_token);
      }
      navigate(`/vote/${encodeURIComponent(pollId)}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Impossible de créer le sondage.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-slate-700">
          Question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={MAX_QUESTION}
          required
          placeholder="Quelle est votre couleur préférée ?"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-500">
          {question.length}/{MAX_QUESTION} caractères
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Options</legend>
        <p className="mt-1 text-xs text-slate-500">
          Entre {MIN_OPTIONS} et {MAX_OPTIONS} choix.
        </p>
        <div className="mt-3 space-y-2">
          {options.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={options.length <= MIN_OPTIONS}
                aria-label={`Supprimer l'option ${index + 1}`}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={addOption}
          disabled={options.length >= MAX_OPTIONS}
        >
          + Ajouter une option
        </Button>
      </fieldset>

      <div>
        <label htmlFor="closesAt" className="block text-sm font-medium text-slate-700">
          Date et heure de clôture
        </label>
        <input
          id="closesAt"
          type="datetime-local"
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && <Alert variant="error" title="Erreur">{error}</Alert>}

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={!isValid}>
          Créer le sondage
        </Button>
      </div>
    </form>
  );
}
