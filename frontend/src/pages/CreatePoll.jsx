/**
 * CreatePoll.jsx — Création + modale succès
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PollForm from '../components/PollForm.jsx';
import ShareButton from '../components/ShareButton.jsx';
import { createPoll } from '../services/api.js';

export default function CreatePoll() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await createPoll(data);
      setSuccess(res);
    } catch (e) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSuccess(null);
    setFormKey((k) => k + 1);
  };

  return (
    <div style={{ padding: '24px 0 48px' }}>
      <div className="container-lg">
        <div style={{ marginBottom: 24 }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
            ← Retour
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="text-2xl fw-700">Créer un sondage</h1>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
                Quelques secondes pour lancer un vote sécurisé.
              </p>
            </div>
            <span className="text-2xl" aria-hidden>
              ⛓
            </span>
          </div>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ marginBottom: 16, display: 'inline-block' }}>
            {error}
          </div>
        )}

        <PollForm key={formKey} onSubmit={handleSubmit} loading={loading} />

        <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '40px 0' }} />
      </div>

      {success && (
        <div
          className="animate-fadeIn"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 16,
          }}
          onClick={closeModal}
          onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          role="presentation"
        >
          <div
            className="card animate-slideUp"
            style={{ maxWidth: 440, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="text-3xl" style={{ textAlign: 'center', marginBottom: 8 }}>
              🎉
            </div>
            <h2 className="text-xl fw-700" style={{ textAlign: 'center', marginBottom: 8 }}>
              Sondage créé avec succès !
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 20 }}>
              Partagez ce lien avec vos participants
            </p>
            <ShareButton pollId={success.poll.id} />
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => navigate(`/vote/${success.poll.id}`)}
              >
                Voir mon sondage
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>
                Créer un autre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
