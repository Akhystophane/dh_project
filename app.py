from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import subprocess
import json
from pathlib import Path
import time

app = Flask(__name__)

# Configuration
FRONTEND_BUILD_DIR = 'docs'  # This matches your vite.config.ts outDir
FRONTEND_SOURCE_DIR = 'frontend'
CONFIG_FILE = 'config.json'

# Default configuration
DEFAULT_CONFIG = {
    "title": "DH Project Frontend",
    "description": "A configurable frontend for digital humanities projects",
    "data": {
        "nodes": [],
        "edges": [],
        "metadata": {}
    },
    "settings": {
        "theme": "default",
        "auto_rebuild": True
    }
}

def load_config():
    """Load configuration from file or create default"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return DEFAULT_CONFIG.copy()

def save_config(config):
    """Save configuration to file"""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def get_frontend_build_time():
    """Get the last modification time of the frontend build"""
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.exists(index_path):
        return os.path.getmtime(index_path)
    return 0

def should_rebuild_frontend():
    """Check if frontend needs to be rebuilt"""
    if not app.config.get('auto_rebuild', True):
        return False
    
    # Check if source files are newer than build
    source_dir = Path(FRONTEND_SOURCE_DIR)
    build_time = get_frontend_build_time()
    
    for file_path in source_dir.rglob('*.tsx'):
        if os.path.getmtime(file_path) > build_time:
            return True
    for file_path in source_dir.rglob('*.ts'):
        if os.path.getmtime(file_path) > build_time:
            return True
    
    return False

@app.route('/')
def index():
    """Serve the main frontend application"""
    # Check if frontend needs rebuilding
    if should_rebuild_frontend():
        try:
            print("🔄 Frontend source changed, rebuilding...")
            os.chdir(FRONTEND_SOURCE_DIR)
            subprocess.run(['npm', 'run', 'build'], check=True, capture_output=True)
            os.chdir('..')
            print("✅ Frontend rebuilt successfully")
        except Exception as e:
            print(f"❌ Failed to rebuild frontend: {e}")
    
    return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the build directory"""
    return send_from_directory(FRONTEND_BUILD_DIR, path)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running',
        'frontend_build_dir': FRONTEND_BUILD_DIR,
        'auto_rebuild': app.config.get('auto_rebuild', True)
    })

@app.route('/api/build-frontend', methods=['POST'])
def build_frontend():
    """Build the frontend application"""
    try:
        # Change to frontend directory
        os.chdir(FRONTEND_SOURCE_DIR)
        
        # Install dependencies if needed
        subprocess.run(['npm', 'install'], check=True, capture_output=True)
        
        # Build the frontend
        result = subprocess.run(['npm', 'run', 'build'], check=True, capture_output=True, text=True)
        
        # Change back to root directory
        os.chdir('..')
        
        return jsonify({
            'status': 'success',
            'message': 'Frontend built successfully',
            'output': result.stdout
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to build frontend',
            'error': e.stderr
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/project-info')
def project_info():
    """Get information about the project structure"""
    try:
        # Check if frontend build exists
        build_exists = os.path.exists(FRONTEND_BUILD_DIR)
        build_files = []
        
        if build_exists:
            build_files = [f for f in os.listdir(FRONTEND_BUILD_DIR) if os.path.isfile(os.path.join(FRONTEND_BUILD_DIR, f))]
        
        return jsonify({
            'frontend_build_dir': FRONTEND_BUILD_DIR,
            'frontend_source_dir': FRONTEND_SOURCE_DIR,
            'build_exists': build_exists,
            'build_files': build_files,
            'current_directory': os.getcwd(),
            'config_file': CONFIG_FILE
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current configuration"""
    config = load_config()
    return jsonify(config)

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update configuration"""
    try:
        new_config = request.get_json()
        current_config = load_config()
        
        # Merge configurations
        current_config.update(new_config)
        save_config(current_config)
        
        return jsonify({
            'status': 'success',
            'message': 'Configuration updated successfully',
            'config': current_config
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/data', methods=['GET'])
def get_data():
    """Get current data"""
    config = load_config()
    return jsonify(config.get('data', {}))

@app.route('/api/data', methods=['POST'])
def update_data():
    """Update data"""
    try:
        new_data = request.get_json()
        config = load_config()
        config['data'] = new_data
        save_config(config)
        
        return jsonify({
            'status': 'success',
            'message': 'Data updated successfully',
            'data': new_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Load configuration
    config = load_config()
    app.config['auto_rebuild'] = config.get('settings', {}).get('auto_rebuild', True)
    
    # Check if frontend is built, if not, build it
    if not os.path.exists(FRONTEND_BUILD_DIR):
        print("Frontend build not found. Building frontend...")
        try:
            os.chdir(FRONTEND_SOURCE_DIR)
            subprocess.run(['npm', 'install'], check=True)
            subprocess.run(['npm', 'run', 'build'], check=True)
            os.chdir('..')
            print("Frontend built successfully!")
        except Exception as e:
            print(f"Failed to build frontend: {e}")
            print("Please run 'cd frontend && npm install && npm run build' manually")
    
    print("Starting Flask server...")
    print("Frontend will be available at: http://localhost:8000")
    print("API endpoints:")
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            print(f"  - {list(rule.methods)[0]} {rule.rule}")
    
    # Use port 8000 instead of 5000 to avoid macOS AirPlay conflicts
    app.run(host='0.0.0.0', port=8000, debug=True) 