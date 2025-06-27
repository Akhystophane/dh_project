# Flask Integration for DH Project Frontend

This Flask application serves your React frontend and provides API endpoints for managing the application.

## Quick Start

### Option 1: Using the Runner Script (Recommended)
```bash
python run.py
```

This script will:
- ✅ Check and install Python dependencies
- ✅ Check and install Node.js dependencies  
- ✅ Build the frontend if needed
- ✅ Start the Flask server

### Option 2: Manual Setup
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Node.js dependencies
cd frontend
npm install

# 3. Build the frontend
npm run build
cd ..

# 4. Start Flask server
python app.py
```

## Access Points

Once running, you can access:

- **Frontend Application**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Project Info**: http://localhost:5000/api/project-info
- **Rebuild Frontend**: POST http://localhost:5000/api/build-frontend

## API Endpoints

### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Flask server is running",
  "frontend_build_dir": "docs"
}
```

### GET /api/project-info
Get information about the project structure and build status.

**Response:**
```json
{
  "frontend_build_dir": "docs",
  "frontend_source_dir": "frontend",
  "build_exists": true,
  "build_files": ["index.html", "assets/..."],
  "current_directory": "/path/to/project"
}
```

### POST /api/build-frontend
Rebuild the frontend application.

**Response:**
```json
{
  "status": "success",
  "message": "Frontend built successfully",
  "output": "Build output..."
}
```

## Project Structure

```
dh_project/
├── app.py              # Main Flask application
├── run.py              # Runner script with setup
├── requirements.txt    # Python dependencies
├── frontend/           # React/TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── docs/              # Built frontend files (served by Flask)
```

## Development Workflow

1. **Make changes to frontend**: Edit files in `frontend/src/`
2. **Rebuild frontend**: 
   - Use the API: `curl -X POST http://localhost:5000/api/build-frontend`
   - Or manually: `cd frontend && npm run build`
3. **Refresh browser**: Your changes will be available at http://localhost:5000

## Course Presentation

For your course, you can:

1. **Demonstrate the setup**:
   ```bash
   python run.py
   ```

2. **Show the API endpoints**:
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/project-info
   ```

3. **Explain the architecture**:
   - Flask serves the built React app
   - API endpoints for management
   - Automatic build process
   - Easy deployment and distribution

## Troubleshooting

### Frontend won't build
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`
- Try manual build: `cd frontend && npm install && npm run build`

### Flask won't start
- Check Python dependencies: `pip install -r requirements.txt`
- Check port 5000 is available
- Try different port: `app.run(port=5001)`

### Frontend not loading
- Check if `docs/` directory exists with built files
- Verify `vite.config.ts` has correct `outDir` setting
- Check browser console for errors 