# Network Visualization Tool for Essays and Persons

A simple tool to visualize relationships between essays and the persons mentioned in them. Perfect for analyzing literary works, historical texts, or any dataset with essays and associated entities.

## 🎬 Try the Demo First!

**Want to see what it looks like? Run the demo:**

```bash
python3 demo.py
```

This will create sample data with historical figures and show you the tool in action!

---

## ⚡ Super Quick Start (1 line!)

**Just run this one command with your data folder:**

```bash
python3 quick_start.py "/path/to/your/essays/folder"
```

**Examples:**
```bash
python3 quick_start.py "/Users/student/Programming Historian lesson"
python3 quick_start.py "/Users/student/Downloads"
python3 quick_start.py "example_data"
```

That's it! The tool will automatically:
1. ✅ Set up the environment (first time only)
2. ✅ Start the server
3. ✅ Visualize all your essays
4. ✅ Open http://localhost:8000 for you

---

## 🚀 Manual Setup (2 minutes)

If you prefer manual control, here's the step-by-step process:

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd dh_project
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python3 app.py
```

### 3. Visualize Your Data
Open a new terminal and run one of these commands:

#### Visualize all essays from a folder:
```bash
python3 simple_visualizer.py --visualize-all-books "/path/to/your/essays/folder"
```

#### Visualize essays from a specific book:
```bash
python3 simple_visualizer.py --visualize-book "/path/to/your/essays/folder/Book 1"
```

#### Visualize specific essays:
```bash
python3 simple_visualizer.py --visualize-multiple-essays [
    "/path/to/essay1.csv",
    "/path/to/essay2.csv"
]
```

### 4. Open Your Browser
Go to: **http://localhost:8000**

That's it! 🎉

## 📁 Expected Data Structure

Your CSV files should be named like this:
```
Book 1/
├── essays 01_01 persons.csv
├── essays 01_02 persons.csv
├── essays 01_03 persons.csv
└── ...

Book 2/
├── essays 02_01 persons.csv
├── essays 02_02 persons.csv
└── ...
```

Each CSV should contain a column with person names (e.g., "person name" or "name").

## 🎮 Using the Visualization

Once you open http://localhost:8000, you'll see:

### **Layout Options:**
- **Random**: Random positioning (good for exploration)
- **Radial**: Essays with more persons are closer to center
- **Betweenness**: Bridge essays/persons are strategically placed
- **Community**: Related essays/persons are clustered together

### **Filtering:**
- **Check/uncheck essays** to show only specific ones
- **Intersection mode**: Shows only persons mentioned in ALL selected essays
- **Auto-rotate**: Toggle network rotation on/off

### **Node Sizes:**
- **Essay nodes** are proportional to their number of persons
- **Person nodes** are smaller and blue
- **Hover** over nodes to see details

## 📊 Example Use Cases

### Literary Analysis
```python
# Analyze character relationships in a novel
python3 simple_visualizer.py --visualize-all-books "/path/to/novel/chapters"
```

### Historical Research
```python
# Study historical figures across different texts
python3 simple_visualizer.py --visualize-book "/path/to/historical/documents/Book 1"
```

### Academic Research
```python
# Compare citations across multiple papers
python3 simple_visualizer.py --visualize-multiple-essays [
    "/path/to/paper1.csv",
    "/path/to/paper2.csv",
    "/path/to/paper3.csv"
]
```

## 🔧 Advanced Usage

### Custom Data Format
If your CSV has different column names, modify `simple_visualizer.py`:
```python
# Change this line to match your column name
if 'person name' in df.columns:  # or 'character', 'entity', etc.
```

### Different Data Types
You can also visualize places, concepts, or any entities:
```python
# Just change the file pattern
pattern = f"essays *_* places.csv"  # instead of persons.csv
```

## 🛠️ Troubleshooting

### Port Already in Use
If you see "Address already in use":
```bash
# Kill the existing process
lsof -ti:8000 | xargs kill -9
# Or change the port in app.py
```

### Missing Dependencies
```bash
pip install pandas requests flask
```

### CSV Encoding Issues
If you see encoding errors, your CSV might have special characters. The tool will skip problematic files and continue with the rest.

## 📈 What You'll Discover

- **Central essays**: Which essays mention the most persons
- **Bridge persons**: People mentioned across multiple essays
- **Communities**: Groups of related essays and persons
- **Patterns**: How different essays connect through shared persons

## 🎯 Tips for Best Results

1. **Use meaningful file names** (like "essays 01_01 persons.csv")
2. **Try different layouts** to see different aspects of your data
3. **Use intersection mode** to find persons common to multiple essays
4. **Turn off rotation** when examining specific relationships
5. **Start with a few essays** before visualizing everything

## 📝 Example Output

When you run the visualization, you'll see something like:
```
📚 Found 3 book folders:
   📖 Book 1
   📖 Book 2
   📖 Book 3
✅ Found: Book 1/essays 01_01 persons.csv
✅ Found: Book 1/essays 01_02 persons.csv
📚 Loading 20 essays from all books...
📊 925 nodes (19 essays, 906 persons), 906 edges
📱 Open http://localhost:8000 to see your visualization
```

## 🎉 Ready to Explore!

Your network visualization is now ready! Open http://localhost:8000 and start exploring the relationships in your data.

---

**Need help?** Check the troubleshooting section or modify the code to fit your specific needs. The tool is designed to be flexible and easy to adapt!
