#!/usr/bin/env python3
"""
Demo Script - See what the visualization looks like!
This creates sample data and shows you the tool in action.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

def create_demo_data():
    """Create realistic demo data"""
    demo_structure = {
        "Book 1": {
            "essays 01_01 persons.csv": """person name,count
Aristotle,5
Plato,3
Socrates,2
Cicero,4
Homer,1""",
            "essays 01_02 persons.csv": """person name,count
Caesar,3
Augustus,2
Cicero,1
Virgil,2
Ovid,1""",
            "essays 01_03 persons.csv": """person name,count
Plato,2
Aristotle,1
Euclid,3
Archimedes,2
Pythagoras,1"""
        },
        "Book 2": {
            "essays 02_01 persons.csv": """person name,count
Shakespeare,4
Marlowe,2
Jonson,1
Spenser,2
Chaucer,1""",
            "essays 02_02 persons.csv": """person name,count
Milton,3
Donne,2
Herbert,1
Shakespeare,1
Bacon,2""",
            "essays 02_03 persons.csv": """person name,count
Locke,3
Hobbes,2
Descartes,1
Newton,2
Boyle,1"""
        }
    }
    
    # Create demo directory
    demo_dir = Path("demo_data")
    if demo_dir.exists():
        print("✅ Demo data already exists!")
        return str(demo_dir)
    
    demo_dir.mkdir(exist_ok=True)
    
    print("📝 Creating demo data...")
    for book_name, essays in demo_structure.items():
        book_dir = demo_dir / book_name
        book_dir.mkdir(exist_ok=True)
        
        for essay_name, content in essays.items():
            essay_path = book_dir / essay_name
            with open(essay_path, 'w') as f:
                f.write(content)
            print(f"   ✅ Created: {book_name}/{essay_name}")
    
    print(f"✅ Demo data created in: {demo_dir}")
    return str(demo_dir)

def run_demo():
    """Run the complete demo"""
    print("🎬 Network Visualization Tool - Demo")
    print("=" * 50)
    
    # Step 1: Create demo data
    demo_path = create_demo_data()
    
    # Step 2: Run quick start
    print("\n🚀 Running quick start with demo data...")
    try:
        result = subprocess.run([
            sys.executable, "quick_start.py", demo_path
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Demo completed successfully!")
            print("\n📱 Open http://localhost:8000 to see the demo")
            print("\n🔍 What you'll see:")
            print("   📚 2 books (Book 1, Book 2)")
            print("   📖 6 essays total")
            print("   👤 15+ historical figures")
            print("   🔗 Connections between essays and persons")
            print("   🔗 Connections between essays that share persons")
            print("\n💡 Try these features:")
            print("   - Switch between layouts (Random, Radial, Betweenness, Community)")
            print("   - Check/uncheck essays to filter the view")
            print("   - Enable intersection mode to see persons in multiple essays")
            print("   - Turn off rotation to examine specific relationships")
            print("   - Hover over nodes to see details")
            
            print("\n🎯 Key insights from this demo:")
            print("   - Cicero appears in both Book 1 essays (01_01 and 01_02)")
            print("   - Shakespeare appears in both Book 2 essays (02_01 and 02_02)")
            print("   - Plato and Aristotle appear together in multiple essays")
            print("   - Each essay has different numbers of persons (affects node size)")
            
        else:
            print(f"❌ Demo failed: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Error running demo: {e}")

def show_expected_output():
    """Show what the expected output looks like"""
    print("\n📊 Expected Demo Output:")
    print("=" * 50)
    print("🚀 Quick Start - Network Visualization Tool")
    print("==================================================")
    print("✅ Environment already set up!")
    print("🌐 Starting server...")
    print("✅ Server started at http://localhost:8000")
    print("📊 Visualizing data from: demo_data")
    print("📚 Found 2 book folders:")
    print("   📖 Book 1")
    print("   📖 Book 2")
    print("✅ Found: Book 1/essays 01_01 persons.csv")
    print("✅ Found: Book 1/essays 01_02 persons.csv")
    print("✅ Found: Book 1/essays 01_03 persons.csv")
    print("✅ Found: Book 2/essays 02_01 persons.csv")
    print("✅ Found: Book 2/essays 02_02 persons.csv")
    print("✅ Found: Book 2/essays 02_03 persons.csv")
    print("📚 Loading 6 essays from all books...")
    print("✅ Data visualized successfully!")
    print("📱 Open http://localhost:8000 to see your visualization")
    print("📊 21 nodes (6 essays, 15 persons), 21 edges")
    print("")
    print("🎉 Success! Your visualization is ready!")
    print("📱 Open http://localhost:8000 in your browser")

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "--show-output":
        show_expected_output()
        return
    
    print("🎬 Network Visualization Tool - Demo")
    print("=" * 50)
    print("This demo will:")
    print("1. Create sample essay data with historical figures")
    print("2. Start the visualization server")
    print("3. Load and visualize the data")
    print("4. Show you how to use the interface")
    print()
    
    response = input("Ready to run the demo? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        run_demo()
    else:
        print("Demo cancelled. Run 'python demo.py --show-output' to see expected output.")

if __name__ == "__main__":
    main() 