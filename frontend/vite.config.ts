import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dh_project/', // Set for GitHub Pages deployment
  build: {
    outDir: '../docs', // Dossier de sortie à la racine du projet
  },
});

