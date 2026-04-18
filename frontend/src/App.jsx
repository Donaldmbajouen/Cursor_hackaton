/**
 * App.jsx — Routes + navigation
 */
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';

function Home() {
  return (
    <div className="page-home page-home-bg">
      <div className="text-3xl fw-700" style={{ marginBottom: 16 }}>
        ⛓ VoteChain
      </div>
      <h1 className="text-2xl fw-700" style={{ marginBottom: 12, maxWidth: 520 }}>
        Votes sécurisés.
        <br />
        Résultats instantanés.
      </h1>
      <p className="text-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 32, maxWidth: 440 }}>
        Lancez un sondage en quelques clics.
      </p>
      <Link to="/create" className="btn btn-primary btn-lg">
        Créer un sondage →
      </Link>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          marginTop: 40,
        }}
      >
        <span className="badge badge-primary">Anti-fraude</span>
        <span className="badge badge-primary">Temps réel</span>
        <span className="badge badge-primary">Sans compte</span>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h1 className="text-2xl fw-700" style={{ marginBottom: 12 }}>
        404
      </h1>
      <p className="text-base" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Page introuvable.
      </p>
      <Link to="/" className="btn btn-primary">
        Accueil
      </Link>
    </div>
  );
}

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="text-base fw-700" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⛓</span> VoteChain
      </Link>
      <Link to="/create" className="btn btn-primary btn-sm">
        Créer un sondage
      </Link>
    </header>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideNav = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh' }}>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/vote/:pollId" element={<Vote />} />
        <Route path="/results/:pollId" element={<Results />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
}
