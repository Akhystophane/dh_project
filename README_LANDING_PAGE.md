# Network Visualization Tool - Landing Page Version

A beautiful, modern web interface for visualizing relationships between essays and persons mentioned in them.

## 🚀 Quick Start

1. **Open the landing page**: Open `landing_page.html` in your web browser
2. **Upload your data**: Drag and drop CSV files or folders containing CSV files
3. **Process & visualize**: Click "Process & Visualize" to see your network
4. **Explore**: Use the 3D visualization to explore relationships

## 📁 What You Need

- **CSV files** with person data (e.g., `essays 01_01 persons.csv`)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **No installation required** - everything runs in the browser!

## 🎯 Features

### Landing Page (`landing_page.html`)
- **Drag & Drop Interface**: Simply drag files or folders onto the upload areas
- **File Validation**: Automatically detects and validates CSV files
- **Progress Tracking**: See real-time progress as your data is processed
- **Modern Design**: Beautiful gradient design with smooth animations
- **Multiple Upload Options**: Upload individual files or entire folders

### Visualization Page (`visualization.html`)
- **3D Interactive Network**: Explore your data in 3D space
- **Multiple Layouts**: Choose from random, radial, grid, or sphere layouts
- **Real-time Controls**: Adjust node sizes, connection widths, and rotation
- **Statistics Panel**: See node counts, edge counts, and data summary
- **Export Functionality**: Download your processed data as JSON

## 📊 Data Format

Your CSV files should contain person names, typically in one of these formats:

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

### Step 1: Upload Data
1. Open `landing_page.html` in your browser
2. Either:
   - **Drag CSV files** onto the "Drop CSV files here" area
   - **Drag a folder** containing CSV files onto the "Drop a folder here" area
   - **Click to browse** and select files manually

### Step 2: Process Data
1. Review the list of detected CSV files
2. Click "Process & Visualize" button
3. Wait for the processing to complete

### Step 3: Explore Visualization
1. The visualization page will open automatically
2. **Mouse Controls**:
   - **Left click + drag**: Rotate the view
   - **Scroll**: Zoom in/out
   - **Right click + drag**: Pan the view
3. **UI Controls**:
   - **Layout**: Change how nodes are arranged
   - **Node Size**: Adjust the size of nodes
   - **Connection Width**: Change line thickness
   - **Auto Rotation**: Toggle automatic rotation
   - **Reset View**: Return to default camera position

## 🎨 Visualization Features

### Node Types
- **🔵 Blue nodes**: Essays (larger, more prominent)
- **🟣 Purple nodes**: Persons mentioned in essays
- **⚪ Gray lines**: Connections between essays and persons

### Layout Options
- **Random**: Nodes placed randomly in 3D space
- **Radial**: Nodes arranged in a circular pattern
- **Grid**: Nodes arranged in a grid layout
- **Sphere**: Nodes distributed on a sphere surface

### Interactive Features
- **Hover effects**: Nodes highlight when you hover over them
- **Smooth animations**: Layout changes are animated
- **Real-time updates**: Changes apply immediately
- **Responsive design**: Works on different screen sizes

## 🔧 Troubleshooting

### No files detected
- Make sure your files have `.csv` extension
- Check that files contain valid CSV data
- Try uploading individual files instead of folders

### Visualization not loading
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Try refreshing the page

### Performance issues
- Reduce the number of files if you have many
- Close other browser tabs to free up memory
- Try a different layout option

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🎯 Use Cases

This tool is perfect for:
- **Digital Humanities**: Analyzing relationships in historical texts
- **Literature Studies**: Mapping character networks in novels
- **Social Network Analysis**: Visualizing connections between people
- **Research Projects**: Exploring data relationships
- **Educational Purposes**: Teaching network analysis concepts

## 🚀 Advanced Usage

### Custom Data Processing
The tool automatically:
- Detects CSV files in uploaded folders
- Extracts person names from various column formats
- Creates network nodes and connections
- Handles different file encodings

### Export Options
- Download processed data as JSON
- Use the exported data in other tools
- Share visualizations with others

## 💡 Tips for Best Results

1. **Organize your data**: Use consistent naming for CSV files
2. **Clean your data**: Remove duplicates and invalid entries
3. **Use descriptive names**: Essay names will appear as node labels
4. **Start small**: Test with a few files first
5. **Explore different layouts**: Each layout reveals different patterns

## 🎉 Ready to Start?

1. Open `landing_page.html` in your browser
2. Upload your CSV files
3. Click "Process & Visualize"
4. Explore your network!

Happy visualizing! 🌐✨ 