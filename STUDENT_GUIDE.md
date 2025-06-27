# Student Guide - Network Visualization Tool

## 🎯 What You Need to Do

### Step 1: Try the Demo (Optional but Recommended)
```bash
python3 demo.py
```
This shows you what the tool looks like with sample data.

### Step 2: Use Your Own Data
```bash
python3 quick_start.py "/path/to/your/essays/folder"
```

**That's it!** 🎉

---

## 📁 Your Data Should Look Like This

```
Your Folder/
├── Book 1/
│   ├── essays 01_01 persons.csv
│   ├── essays 01_02 persons.csv
│   └── essays 01_03 persons.csv
├── Book 2/
│   ├── essays 02_01 persons.csv
│   ├── essays 02_02 persons.csv
│   └── essays 02_03 persons.csv
└── ...
```

Each CSV file should have a column with person names (like "person name" or "name").

---

## 🔍 What You'll See

1. **Essays** (large nodes) - Each essay from your data
2. **Persons** (small blue nodes) - People mentioned in the essays
3. **Connections** (lines) - Who is mentioned in which essay
4. **Essay connections** - Essays that share the same persons

---

## 🎮 How to Use the Interface

### Layout Options:
- **Random**: Good for exploration
- **Radial**: Essays with more persons are closer to center
- **Betweenness**: Bridge essays/persons are strategically placed
- **Community**: Related essays/persons are clustered together

### Filtering:
- **Check/uncheck essays** to show only specific ones
- **Intersection mode**: Shows only persons mentioned in ALL selected essays
- **Auto-rotate**: Toggle network rotation on/off

---

## 💡 Common Use Cases

### Programming Historian Lesson:
```bash
python3 quick_start.py "/Users/student/Programming Historian lesson"
```

### Downloaded Essays:
```bash
python3 quick_start.py "/Users/student/Downloads"
```

### Specific Book:
```bash
python3 simple_visualizer.py --visualize-book "/path/to/Book 1"
```

---

## 🛠️ If Something Goes Wrong

### Port Already in Use:
```bash
lsof -ti:8000 | xargs kill -9
```

### Missing Dependencies:
```bash
pip install pandas requests flask
```

### Can't Find Your Files:
- Make sure the folder path is correct
- Check that your CSV files are named correctly
- Try the demo first to make sure everything works

---

## 🎉 You're Ready!

1. Run the demo: `python3 demo.py`
2. Use your data: `python3 quick_start.py "/your/path"`
3. Open http://localhost:8000
4. Explore your network!

**Need help?** Check the main README.md for more details. 