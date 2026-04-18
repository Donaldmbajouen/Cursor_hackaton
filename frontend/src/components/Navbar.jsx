/**
 * Navbar.jsx — Barre de navigation dynamique selon l'auth
 */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="navbar app-navbar">
      <Link to="/" className="navbar-brand">
        <span aria-hidden>⛓</span>
        <span>VoteChain</span>
      </Link>

      <nav className="navbar-links">
        {isAuthenticated && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Dashboard
          </NavLink>
        )}
        <NavLink
          to="/create"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          Créer un sondage
        </NavLink>
      </nav>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <div className="navbar-user">
            <button
              type="button"
              className="navbar-avatar"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menu utilisateur"
            >
              {initial}
            </button>
            {menuOpen && (
              <div
                className="navbar-menu animate-slideDown"
                role="menu"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="navbar-menu-head">
                  <span className="text-sm fw-600">{user?.name || 'Compte'}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {user?.email}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="navbar-menu-item"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  Mon dashboard
                </Link>
                <button
                  type="button"
                  className="navbar-menu-item navbar-menu-danger"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Se connecter
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
