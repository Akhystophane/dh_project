#!/usr/bin/env python3
"""
Quick Setup Script for Network Visualization Tool
Run this script to set up everything automatically!
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required!")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible!")
    return True

def setup_virtual_environment():
    """Set up virtual environment"""
    if os.path.exists("venv"):
        print("✅ Virtual environment already exists!")
        return True
    
    return run_command("python -m venv venv", "Creating virtual environment")

def install_dependencies():
    """Install required packages"""
    # Determine the correct pip command
    if platform.system() == "Windows":
        pip_cmd = "venv\\Scripts\\pip"
    else:
        pip_cmd = "venv/bin/pip"
    
    return run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies")

def create_example_data():
    """Create example data structure for testing"""
    if not os.path.exists("example_data"):
        os.makedirs("example_data")
        os.makedirs("example_data/Book 1")
        
        # Create example CSV files
        example_csv = """person name,count
Aristotle,5
Plato,3
Socrates,2
Cicero,4"""
        
        with open("example_data/Book 1/essays 01_01 persons.csv", "w") as f:
            f.write(example_csv)
        
        with open("example_data/Book 1/essays 01_02 persons.csv", "w") as f:
            f.write("""person name,count
Caesar,3
Augustus,2
Cicero,1""")
        
        print("✅ Created example data in 'example_data/' folder")

def main():
    """Main setup function"""
    print("🚀 Network Visualization Tool - Quick Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Set up virtual environment
    if not setup_virtual_environment():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Create example data
    create_example_data()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate the virtual environment:")
    if platform.system() == "Windows":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    
    print("2. Start the server:")
    print("   python app.py")
    
    print("3. In another terminal, visualize your data:")
    print("   python simple_visualizer.py --visualize-book 'example_data/Book 1'")
    
    print("4. Open your browser:")
    print("   http://localhost:8000")
    
    print("\n💡 Quick test:")
    print("   python simple_visualizer.py --visualize-book 'example_data/Book 1'")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1) 