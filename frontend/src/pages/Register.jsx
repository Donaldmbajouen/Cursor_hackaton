/**
 * Register.jsx — Création de compte utilisateur
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    if (!form.email) return 'Email requis';
    if (form.password.length < 8) return 'Mot de passe : 8 caractères minimum';
    if (form.password !== form.confirm) return 'Les mots de passe ne correspondent pas';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name || null,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Lancez et suivez vos sondages depuis un seul espace."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="auth-link">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="name">
            Nom (optionnel)
          </label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange('name')}
            autoComplete="name"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="8 caractères minimum"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="new-password"
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="label" htmlFor="confirm">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.confirm}
            onChange={handleChange('confirm')}
            autoComplete="new-password"
            required
          />
        </div>
        {error && <div className="error-text" role="alert">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 20 }}
          disabled={loading}
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </AuthLayout>
  );
}
