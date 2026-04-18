/**
 * App.jsx — Routes + navigation
 */
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Results from './pages/Results.jsx';
import Vote from './pages/Vote.jsx';

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

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const noNavbar = ['/login', '/register'];
  const hideNav = noNavbar.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNav && <Navbar />}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Landing />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/create"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <CreatePoll />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/vote/:pollId"
              element={
                <PageTransition>
                  <Vote />
                </PageTransition>
              }
            />
            <Route
              path="/results/:pollId"
              element={
                <PageTransition>
                  <Results />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFound />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
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
