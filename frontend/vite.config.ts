import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from '/dh_project/' for local Flask serving
  build: {
    outDir: '../docs', // Dossier de sortie à la racine du projet
  },
});

