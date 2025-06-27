# 🚀 DH Project Frontend - Easy Setup Guide

This guide shows you how to quickly set up and customize this frontend for your own data.

## 🎯 Quick Start (2 Steps!)

### Step 1: Run Setup
```bash
python3 setup.py
```

### Step 2: Start Server
```bash
python3 app.py
```

Then open http://localhost:5000 in your browser! 🎉

---

## 📋 What You Get

✅ **Automatic Setup**: Installs all dependencies  
✅ **Configurable Data**: Easy to replace with your own data  
✅ **Auto-Rebuild**: Frontend updates automatically when you edit code  
✅ **API Endpoints**: Manage data programmatically  
✅ **Ready for Course**: Perfect for demonstrations  

---

## 🔧 Customizing Your Data

### Option 1: Edit config.json (Easiest)
```json
{
  "data": {
    "nodes": [
      {
        "id": 1,
        "label": "Your Node",
        "type": "person",
        "properties": {
          "name": "Your Name",
          "age": 25
        }
      }
    ],
    "edges": [
      {
        "source": 1,
        "target": 2,
        "label": "relationship"
      }
    ]
  }
}
```

### Option 2: Use API (Programmatic)
```bash
# Update data via API
curl -X POST http://localhost:5000/api/data \
  -H 'Content-Type: application/json' \
  -d '{
    "nodes": [{"id": 1, "label": "My Data"}],
    "edges": []
  }'
```

### Option 3: Python Script
```python
import requests

# Update data
new_data = {
    "nodes": [{"id": 1, "label": "Python Node"}],
    "edges": []
}

response = requests.post('http://localhost:5000/api/data', json=new_data)
print(response.json())
```

---

## 🛠️ For Developers

### Frontend Development
```bash
cd frontend
npm run dev  # Development server
npm run build  # Build for production
```

### Auto-Rebuild Feature
- Edit files in `frontend/src/`
- Refresh browser at http://localhost:5000
- Changes are automatically detected and rebuilt!

### API Endpoints
- `GET /api/health` - Server status
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration
- `GET /api/data` - Get data
- `POST /api/data` - Update data

---

## 📁 Project Structure
```
dh_project/
├── app.py              # Flask server
├── setup.py            # Easy setup script
├── config.json         # Your data configuration
├── frontend/           # React/TypeScript code
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── docs/              # Built frontend (served by Flask)
```

---

## 🎓 For Course Presentations

### Demo Script
1. **Show Setup**: `python3 setup.py`
2. **Start Server**: `python3 app.py`
3. **Open Browser**: http://localhost:5000
4. **Show API**: `curl http://localhost:5000/api/health`
5. **Update Data**: Edit `config.json` and refresh

### Key Features to Highlight
- ✅ **One-command setup**
- ✅ **Configurable data structure**
- ✅ **Auto-rebuild capability**
- ✅ **API-driven architecture**
- ✅ **Easy distribution**

---

## 🔄 Workflow Examples

### Adding New Data
1. Edit `config.json`
2. Refresh browser
3. See your changes instantly!

### Frontend Development
1. Edit `frontend/src/` files
2. Refresh browser
3. Auto-rebuild happens automatically!

### API Integration
1. Use `POST /api/data` to update data
2. Frontend reflects changes immediately
3. Perfect for dynamic applications

---

## 🚨 Troubleshooting

### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Then run setup again
python3 setup.py
```

### "Port 5000 in use"
```bash
# Change port in app.py
app.run(port=5001)  # Use different port
```

### "Frontend not loading"
```bash
# Rebuild frontend
cd frontend && npm run build
cd .. && python3 app.py
```

---

## 🎯 Perfect for Your Course!

This setup provides:
- **Easy demonstration** of full-stack development
- **Configurable architecture** for different use cases
- **Professional presentation** with API endpoints
- **Real-world workflow** with auto-rebuild
- **Easy distribution** for others to use

Your frontend is now callable, configurable, and ready for any audience! 🚀 