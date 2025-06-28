# Network Visualization Tool - Vite Version

A modern, academic-style web application for visualizing relationships between essays and persons mentioned in them, built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Development Mode
```bash
cd frontend
npm run dev
```
Then open http://localhost:5173 in your browser.

### Production Build
```bash
cd frontend
npm run build
npm run preview
```

## 🎯 Features

### Academic Design
- **Clean, scholarly interface** with Georgia serif typography
- **Muted color palette** suitable for academic use
- **Professional layout** with clear sections and spacing
- **Responsive design** that works on all devices

### File Upload
- **Drag & drop interface** for CSV files and folders
- **File validation** - automatically detects CSV files
- **Progress tracking** with visual feedback
- **File management** - view, remove, and clear files

### 3D Visualization
- **Interactive 3D network** using Three.js and React Three Fiber
- **Multiple layout options** (random, radial, grid, sphere)
- **Real-time controls** for node size, connection width, rotation
- **Statistics panel** showing comprehensive data metrics
- **Export functionality** for processed data

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── LandingPage.tsx      # Academic landing page
│   ├── LandingPage.css      # Academic styling
│   ├── Network.tsx          # 3D visualization component
│   └── App.css              # Global styles
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics
- **React Three Fiber** - React wrapper for Three.js
- **CSS3** - Styling with academic design

## 📊 Data Format

Your CSV files should contain person names in one of these formats:

```csv
person name,count
Aristotle,5
Plato,3
Socrates,2
```

or

```csv
name,frequency
Caesar,3
Augustus,2
Cicero,1
```

## 🎮 How to Use

### Step 1: Start the Application
1. Navigate to the frontend directory
2. Run `npm run dev`
3. Open http://localhost:5173 in your browser

### Step 2: Upload Data
1. **Drag CSV files** onto the "Individual Files" area
2. **Drag a folder** containing CSV files onto the "Folder Upload" area
3. **Click to browse** and select files manually
4. Review the list of detected CSV files

### Step 3: Process & Visualize
1. Click "Process & Visualize" button
2. Watch the progress as your data is processed
3. The 3D visualization will appear automatically

### Step 4: Explore the Network
1. **Mouse Controls**:
   - **Left click + drag**: Rotate the view
   - **Scroll**: Zoom in/out
   - **Right click + drag**: Pan the view
2. **UI Controls**:
   - **Layout**: Change how nodes are arranged
   - **Node Size**: Adjust the size of nodes
   - **Connection Width**: Change line thickness
   - **Auto Rotation**: Toggle automatic rotation
   - **Reset View**: Return to default camera position

## 🎨 Academic Design Features

### Typography
- **Georgia serif font** for scholarly appearance
- **Proper hierarchy** with clear headings and subheadings
- **Readable line spacing** and letter spacing

### Color Scheme
- **Muted blues and grays** for professional look
- **Subtle gradients** for depth without distraction
- **High contrast** for accessibility

### Layout
- **Clean grid system** with proper spacing
- **Card-based design** for organized information
- **Responsive breakpoints** for all screen sizes

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding Features
1. **New Components**: Create in `src/` directory
2. **Styling**: Use CSS modules or global CSS
3. **Types**: Define interfaces in component files
4. **Dependencies**: Add via `npm install`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files are in the `docs/` directory and can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static file server

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
VITE_API_URL=http://localhost:8000
```

## 🎯 Academic Use Cases

This tool is perfect for:
- **Digital Humanities Research** - Analyzing relationships in historical texts
- **Literature Studies** - Mapping character networks in novels
- **Social Network Analysis** - Visualizing connections between people
- **Research Projects** - Exploring data relationships
- **Educational Purposes** - Teaching network analysis concepts

## 💡 Tips for Best Results

1. **Organize your data**: Use consistent naming for CSV files
2. **Clean your data**: Remove duplicates and invalid entries
3. **Use descriptive names**: Essay names will appear as node labels
4. **Start small**: Test with a few files first
5. **Explore different layouts**: Each layout reveals different patterns

## 🔍 Troubleshooting

### Build Errors
- Check TypeScript errors with `npm run build`
- Ensure all dependencies are installed
- Clear node_modules and reinstall if needed

### Runtime Issues
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try refreshing the page

### Performance Issues
- Reduce the number of files if you have many
- Close other browser tabs to free up memory
- Try a different layout option

## 🎉 Ready to Start?

1. Run `npm run dev` in the frontend directory
2. Open http://localhost:5173 in your browser
3. Upload your CSV files
4. Click "Process & Visualize"
5. Explore your 3D network!

Happy visualizing! 🌐✨ 