#!/usr/bin/env python3
"""
Simple runner script for the Flask application that serves the frontend.
This script handles the setup and provides a user-friendly interface.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        print("✅ Flask is installed")
    except ImportError:
        print("❌ Flask is not installed. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Flask installed successfully")

def check_node_dependencies():
    """Check if Node.js dependencies are installed"""
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("📦 Node.js dependencies not found. Installing...")
        try:
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            print("✅ Node.js dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install Node.js dependencies: {e}")
            return False
    else:
        print("✅ Node.js dependencies are installed")
    
    return True

def build_frontend():
    """Build the frontend application"""
    frontend_dir = Path("frontend")
    build_dir = Path("docs")
    
    if build_dir.exists():
        print("✅ Frontend build already exists")
        return True
    
    print("🔨 Building frontend...")
    try:
        subprocess.run(["npm", "run", "build"], cwd=frontend_dir, check=True)
        print("✅ Frontend built successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build frontend: {e}")
        return False

def main():
    """Main function to run the application"""
    print("🚀 Starting DH Project Flask Application")
    print("=" * 50)
    
    # Check Python dependencies
    check_dependencies()
    
    # Check Node.js dependencies
    if not check_node_dependencies():
        print("❌ Cannot proceed without Node.js dependencies")
        sys.exit(1)
    
    # Build frontend if needed
    if not build_frontend():
        print("❌ Cannot proceed without frontend build")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup complete! Starting Flask server...")
    print("📱 Frontend will be available at: http://localhost:5000")
    print("🔧 API endpoints:")
    print("   - GET  /api/health - Health check")
    print("   - POST /api/build-frontend - Rebuild frontend")
    print("   - GET  /api/project-info - Project information")
    print("=" * 50)
    
    # Import and run the Flask app
    from app import app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == "__main__":
    main() 