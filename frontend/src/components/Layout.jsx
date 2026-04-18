/**
 * Layout.jsx — Shell global (header + conteneur + footer)
 * Responsable : Dev Frontend
 */
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-brand-600"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
              V
            </span>
            VoteChain
          </Link>
          <nav className="text-sm">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-surface-muted hover:text-brand-600"
            >
              Créer un sondage
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 text-center text-xs text-slate-500">
          VoteChain — Plateforme de votes en ligne
        </div>
      </footer>
    </div>
  );
}
