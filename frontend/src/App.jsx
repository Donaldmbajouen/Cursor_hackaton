/**
 * App.jsx — Routes principales
 * Responsable : Dev Frontend
 */
import { Routes, Route, Link } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';

export default function App() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <Link to="/">Créer</Link>
        <Link to="/vote/demo">Voter</Link>
        <Link to="/results/demo">Résultats</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/vote/:pollId" element={<Vote />} />
        <Route path="/results/:pollId" element={<Results />} />
      </Routes>
    </div>
  );
}
