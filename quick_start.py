#!/usr/bin/env python3
"""
Quick Start Script - One line to visualize your data!
Usage: python quick_start.py "path/to/your/data"
"""

import sys
import subprocess
import os
from pathlib import Path

def run_setup():
    """Run the setup script if needed"""
    if not os.path.exists("venv"):
        print("🚀 First time setup...")
        subprocess.run([sys.executable, "setup.py"], check=True)
        print("✅ Setup complete!")
    else:
        print("✅ Environment already set up!")

def start_server():
    """Start the Flask server"""
    print("🌐 Starting server...")
    try:
        # Start server in background
        subprocess.Popen([sys.executable, "app.py"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        print("✅ Server started at http://localhost:8000")
        return True
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

def visualize_data(data_path):
    """Visualize the data"""
    print(f"📊 Visualizing data from: {data_path}")
    try:
        result = subprocess.run([
            sys.executable, "simple_visualizer.py", 
            "--visualize-all-books", data_path
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Data visualized successfully!")
            print("📱 Open http://localhost:8000 to see your visualization")
            return True
        else:
            print(f"❌ Visualization failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("🚀 Quick Start - Network Visualization Tool")
        print("=" * 50)
        print("Usage: python quick_start.py 'path/to/your/data'")
        print()
        print("Examples:")
        print("  python quick_start.py '/Users/student/Programming Historian lesson'")
        print("  python quick_start.py '/Users/student/Downloads'")
        print("  python quick_start.py 'example_data'")
        print()
        print("💡 The tool will automatically:")
        print("   1. Set up the environment (first time only)")
        print("   2. Start the server")
        print("   3. Visualize all essays in your folder")
        print("   4. Open http://localhost:8000 for you")
        return
    
    data_path = sys.argv[1]
    
    if not Path(data_path).exists():
        print(f"❌ Path not found: {data_path}")
        return
    
    print("🚀 Quick Start - Network Visualization Tool")
    print("=" * 50)
    
    # Step 1: Setup
    run_setup()
    
    # Step 2: Start server
    if not start_server():
        return
    
    # Step 3: Visualize data
    if visualize_data(data_path):
        print("\n🎉 Success! Your visualization is ready!")
        print("📱 Open http://localhost:8000 in your browser")
        print("\n💡 Tips:")
        print("   - Try different layouts (Random, Radial, Betweenness, Community)")
        print("   - Use intersection mode to find common persons")
        print("   - Check/uncheck essays to filter the view")
    else:
        print("\n❌ Something went wrong. Check the error messages above.")

if __name__ == "__main__":
    main() 