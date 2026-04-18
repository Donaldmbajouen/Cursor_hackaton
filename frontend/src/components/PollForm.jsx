/**
 * PollForm.jsx — Création de sondage
 */
import { useEffect, useMemo, useRef, useState } from 'react';

function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function PollForm({ onSubmit, loading }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closesAt, setClosesAt] = useState('');
  const [shortcut, setShortcut] = useState(null);
  const [touched, setTouched] = useState({});
  const [dragIndex, setDragIndex] = useState(null);
  const newInputRef = useRef(null);

  const minClose = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return toDatetimeLocalValue(d);
  }, []);

  useEffect(() => {
    if (!closesAt) {
      const d = new Date();
      d.setHours(d.getHours() + 1);
      setClosesAt(toDatetimeLocalValue(d));
    }
  }, [closesAt]);

  const errors = {};
  if (touched.question || touched.all) {
    if (!question.trim()) errors.question = 'La question est obligatoire';
    else if (question.length > 200) errors.question = 'Maximum 200 caractères';
  }
  if (touched.options || touched.all) {
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2) errors.options = 'Au moins 2 options renseignées';
    if (options.length > 10) errors.options = 'Maximum 10 options';
  }
  if (touched.closesAt || touched.all) {
    const dt = parseLocalInput(closesAt);
    if (!closesAt) errors.closesAt = 'Date obligatoire';
    else if (dt) {
      const minD = parseLocalInput(minClose);
      if (minD && dt < minD) errors.closesAt = 'La clôture doit être au moins dans 5 minutes';
    }
  }

  const hasErrors = Object.values(errors).some(Boolean);
  const valid =
    question.trim().length > 0 &&
    question.length <= 200 &&
    options.filter((o) => o.trim()).length >= 2 &&
    options.length <= 10 &&
    parseLocalInput(closesAt) != null &&
    !hasErrors;

  const applyShortcut = (key) => {
    const d = new Date();
    if (key === '1h') d.setHours(d.getHours() + 1);
    else if (key === '24h') d.setHours(d.getHours() + 24);
    else if (key === '7j') d.setDate(d.getDate() + 7);
    else if (key === '30j') d.setDate(d.getDate() + 30);
    setClosesAt(toDatetimeLocalValue(d));
    setShortcut(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ all: true });
    if (!valid) return;
    const dt = parseLocalInput(closesAt);
    await onSubmit({
      question: question.trim(),
      options: options.map((o) => o.trim()).filter(Boolean),
      closes_at: dt.toISOString(),
    });
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((o) => [...o, '']);
    window.setTimeout(() => newInputRef.current?.focus(), 50);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions((o) => o.filter((_, idx) => idx !== i));
  };

  const onDragStart = (i) => setDragIndex(i);
  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) return;
    setOptions((o) => {
      const n = [...o];
      const [m] = n.splice(dragIndex, 1);
      n.splice(i, 0, m);
      return n;
    });
    setDragIndex(null);
  };

  const taRef = useRef(null);
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [question]);

  return (
    <form className="card animate-slideUp" onSubmit={handleSubmit}>
      <h2 className="text-xl fw-700" style={{ marginBottom: 8 }}>
        ✨ Créer un nouveau sondage
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Partagez une question et des réponses possibles.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label className="label" htmlFor="q">
          Question *
        </label>
        <textarea
          id="q"
          ref={taRef}
          className={`input ${errors.question ? 'input-error' : ''}`}
          placeholder="Posez votre question…"
          maxLength={200}
          value={question}
          disabled={loading}
          onBlur={() => setTouched((t) => ({ ...t, question: true }))}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div
          className="text-xs"
          style={{
            marginTop: 4,
            color: question.length > 180 ? 'var(--color-danger)' : 'var(--color-text-muted)',
          }}
        >
          {question.length}/200 caractères
        </div>
        {errors.question && <div className="error-text">{errors.question}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <span className="label">Options de réponse *</span>
        {options.map((opt, i) => (
          <div
            key={i}
            className="animate-slideDown"
            style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <input
              ref={i === options.length - 1 ? newInputRef : undefined}
              className={`input ${errors.options ? 'input-error' : ''}`}
              placeholder={`Option ${i + 1}`}
              value={opt}
              disabled={loading}
              onBlur={() => setTouched((t) => ({ ...t, options: true }))}
              onChange={(e) =>
                setOptions((o) => o.map((v, j) => (j === i ? e.target.value : v)))
              }
            />
            <button
              type="button"
              className="btn btn-ghost-danger btn-sm"
              disabled={options.length <= 2 || loading}
              onClick={() => removeOption(i)}
              aria-label="Supprimer l'option"
            >
              🗑
            </button>
          </div>
        ))}
        {errors.options && <div className="error-text">{errors.options}</div>}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ marginTop: 8 }}
          disabled={options.length >= 10 || loading}
          onClick={addOption}
        >
          + Ajouter une option
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="label" htmlFor="closes">
          Date de clôture *
        </label>
        <input
          id="closes"
          type="datetime-local"
          className={`input ${errors.closesAt ? 'input-error' : ''}`}
          min={minClose}
          value={closesAt}
          disabled={loading}
          onBlur={() => setTouched((t) => ({ ...t, closesAt: true }))}
          onChange={(e) => {
            setClosesAt(e.target.value);
            setShortcut(null);
          }}
        />
        {errors.closesAt && <div className="error-text">{errors.closesAt}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {[
            { k: '1h', label: '1h' },
            { k: '24h', label: '24h' },
            { k: '7j', label: '7j' },
            { k: '30j', label: '30j' },
          ].map(({ k, label }) => (
            <button
              key={k}
              type="button"
              className={shortcut === k ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              disabled={loading}
              onClick={() => applyShortcut(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>
          Raccourcis de date
        </p>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={!valid || loading} style={{ width: '100%' }}>
        {loading ? (
          <>
            <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
            Création en cours…
          </>
        ) : (
          <>Créer le sondage →</>
        )}
      </button>
    </form>
  );
}
