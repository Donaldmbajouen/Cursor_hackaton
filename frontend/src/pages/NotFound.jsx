/**
 * NotFound.jsx — Route 404
 * Responsable : Dev Frontend
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page introuvable</h1>
      <p className="mt-2 text-slate-600">
        Le sondage demandé n'existe pas ou le lien est incorrect.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
      >
        Créer un nouveau sondage
      </Link>
    </div>
  );
}
