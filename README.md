# Network Visualization Tool for Essays and Entities

A modern, React-based tool to visualize relationships between essays and referenced entities (like persons, places, or events).

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd dh_project
   ```
2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Start the frontend:**
   ```bash
   npm run dev
   ```
4. **Open your browser:**
   Go to [http://localhost:5173/dh_project/](http://localhost:5173/dh_project/) (or the URL shown in your terminal)

## 🛠️ How to Use or Fork

- **To use:**
  - Place your data/config files in the appropriate location (see below).
  - Start the frontend as above.
  - Interact with the 3D network visualization in your browser.

- **To fork and customize:**
  1. Fork this repo on GitHub.
  2. Clone your fork and make changes to the React code in `frontend/src/`.
  3. Commit and push your changes.
  4. Optionally, deploy your forked app (e.g., with Vercel, Netlify, or your own server).

## 📁 Data Format

- By default, the app looks for a `config.json` file describing your essays and entities.
- You can also upload CSV files via the landing page.
- See `frontend/public/config.json` for an example structure.

## ✨ Features
- 3D interactive network visualization
- Node size, color, and shape reflect entity properties
- Hover and click for details
- Keyboard and trackpad navigation
- Customizable appearance and layout

## 🧹 Cleaning Up
- All legacy scripts and HTML files have been removed.
- This branch is focused on the React-based workflow only.

---

**Questions or issues?** Open an issue or fork and adapt the tool to your needs!
