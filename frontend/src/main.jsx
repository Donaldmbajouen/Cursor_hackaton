/**
 * main.jsx — Point d'entrée React
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 60,
  disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
