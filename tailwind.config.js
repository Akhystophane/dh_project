/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',    // Fichier HTML principal
    './src/**/*.{js,ts,jsx,tsx}', // Fichiers JS/TS/React
  ],
  theme: {
    extend: {}, // Vous pouvez étendre la configuration par défaut ici
  },
  plugins: [], // Ajouter des plugins si nécessaire
}