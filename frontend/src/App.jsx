/**
 * App.jsx — Routes principales
 * Responsable : Dev Frontend
 */
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/vote/:pollId" element={<Vote />} />
        <Route path="/results/:pollId" element={<Results />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
