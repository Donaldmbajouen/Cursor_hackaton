/**
 * AuthLayout.jsx — Carte centrale pour Login/Register
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <motion.div
        className="card auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Link to="/" className="auth-brand">
          <span aria-hidden>⛓</span> VoteChain
        </Link>
        <h1 className="text-xl fw-700" style={{ marginTop: 12 }}>
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}
          >
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: 24 }}>{children}</div>
        {footer && (
          <div
            className="text-sm"
            style={{
              color: 'var(--color-text-secondary)',
              marginTop: 24,
              textAlign: 'center',
            }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}
