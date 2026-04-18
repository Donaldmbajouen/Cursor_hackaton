/**
 * Login.jsx — Connexion utilisateur
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour"
      subtitle="Connectez-vous pour accéder à votre dashboard."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="auth-link">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
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
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </AuthLayout>
  );
}
