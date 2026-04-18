/**
 * vite.config.js — Configuration Vite + React
 * Responsable : Dev Frontend
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TODO Dev : proxy API / WebSocket si besoin en dev local
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
