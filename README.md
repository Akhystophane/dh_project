# DH Project: Visualizing La Fontaine's Fables

## 🌐 Access the Web Page
You can access the interactive web page here:  
👉 [https://akhystophane.github.io/dh_project/](https://akhystophane.github.io/dh_project/)

---

## 📖 Project Overview
This project visualizes the network of characters and fables from **La Fontaine's Fables** using an interactive 3D interface built with **React** and **Three.js**. The network highlights the relationships between animals and the fables they appear in.

Key Features:
- Visualize nodes representing animals and fables.
- Explore links between animals and their shared fables.
- Enable intersection mode to find fables shared by multiple animals.
- View detailed network statistics in the sidebar menu.

---

## 📂 Repository Structure

### 🔹 Main Code
- `src/`: Contains the React code for the web application.
- `vite.config.ts`: Configuration file for building and deploying the project with Vite.

### 🔹 Data Manager
- `datamanager/`: Directory containing all files used to build the network:
  - `nodes.csv`: List of nodes (animals and fables) in the network.
  - `edges.csv`: List of connections (links) between nodes.
  - **Fables Data**: Texts of the fables used for generating the network.

### 🔹 Static Assets
- `public/`: Contains static files such as images, fonts, and other resources.

---

## 📊 Data and Tools

### 🔸 Data Sources
1. **Nodes (`nodes.csv`)**: Contains information about animals and fables.
2. **Edges (`edges.csv`)**: Defines the relationships between animals and the fables they are part of.

### 🔸 External Tools
- **Voyant Tools Corpus**: Analyze the texts of the fables using this corpus:  
  👉 [Voyant Tools Corpus](https://voyant-tools.org/?corpus=2c78c8cb9863ccaae86986311c2a583b&panels=corpusterms,reader,trends,summary,contexts)

---

## 🚀 How to Run the Project Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/akhystophane/dh_project.git
