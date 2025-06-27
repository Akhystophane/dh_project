#!/usr/bin/env python3
"""
Demo script to load CSV data and display it in the frontend
Run this script to see your CSV data visualized!
"""

import pandas as pd
import requests
import json
import subprocess
import sys

def install_packages():
    """Install required packages if not already installed"""
    packages = ['pandas', 'requests']
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed")

def load_from_existing_csv():
    """Load data from the existing nodes.csv and edges.csv files"""
    
    try:
        print("📖 Loading data from existing CSV files...")
        
        # Load nodes
        nodes_df = pd.read_csv("DataManagement/nodes.csv")
        nodes = []
        for idx, row in nodes_df.iterrows():
            node = {
                "id": idx + 1,
                "label": row['label'],
                "type": "character",
                "properties": {
                    "original_id": row['id'] if 'id' in row else row['label']
                }
            }
            nodes.append(node)
        
        # Load edges
        edges_df = pd.read_csv("DataManagement/edges.csv")
        edges = []
        for idx, row in edges_df.iterrows():
            # Find source and target node IDs
            source_id = None
            target_id = None
            
            for node in nodes:
                if node['properties']['original_id'] == row['source']:
                    source_id = node['id']
                if node['properties']['original_id'] == row['target']:
                    target_id = node['id']
            
            if source_id and target_id:
                edges.append({
                    "source": source_id,
                    "target": target_id,
                    "label": "appears_in",
                    "properties": {
                        "weight": row['weight'] if 'weight' in row else 1
                    }
                })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "project_name": "Fables Network Analysis",
                "source": "existing_csv",
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "description": "Network analysis of characters in La Fontaine's Fables"
            }
        }
        
    except Exception as e:
        print(f"❌ Error loading existing CSV: {e}")
        return None

def send_to_frontend(data, server_url="http://localhost:5000"):
    """Send data to the frontend via Flask API"""
    
    try:
        print("🌐 Sending data to frontend...")
        
        # Send data to API
        response = requests.post(
            f"{server_url}/api/data",
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Data sent successfully to frontend!")
            print(f"🌐 Open {server_url} to view your data")
            return response.json()
        else:
            print(f"❌ Failed to send data: {response.status_code}")
            print(response.text)
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server")
        print("💡 Make sure to run: python app.py")
        return None
    except Exception as e:
        print(f"❌ Error sending data: {e}")
        return None

def check_server_status(server_url="http://localhost:5000"):
    """Check if Flask server is running"""
    try:
        response = requests.get(f"{server_url}/api/health")
        if response.status_code == 200:
            print("✅ Flask server is running")
            return True
        else:
            print("❌ Flask server is not responding properly")
            return False
    except:
        print("❌ Flask server is not running")
        print("💡 Start it with: python app.py")
        return False

def main():
    """Main function to demonstrate CSV loading"""
    
    print("🚀 CSV to Frontend Demo")
    print("=" * 50)
    
    # Install packages
    install_packages()
    
    # Check server status
    if not check_server_status():
        print("\n💡 To start the Flask server, run:")
        print("   source venv/bin/activate")
        print("   python app.py")
        return
    
    # Load data from existing CSV files
    data = load_from_existing_csv()
    if not data:
        print("❌ Failed to load CSV data")
        return
    
    print(f"✅ Loaded {len(data['nodes'])} nodes and {len(data['edges'])} edges")
    print(f"📊 Project: {data['metadata']['project_name']}")
    
    # Send to frontend
    result = send_to_frontend(data)
    if result:
        print("\n🎉 Success! Your CSV data is now visible in the frontend!")
        print("📱 Open your browser and go to: http://localhost:5000")
        print("\n📋 Data Summary:")
        print(f"   - Nodes: {len(data['nodes'])}")
        print(f"   - Edges: {len(data['edges'])}")
        print(f"   - Project: {data['metadata']['project_name']}")
        
        # Show some sample nodes
        print("\n🔍 Sample Nodes:")
        for i, node in enumerate(data['nodes'][:5]):
            print(f"   {i+1}. {node['label']} ({node['type']})")
        if len(data['nodes']) > 5:
            print(f"   ... and {len(data['nodes']) - 5} more nodes")

if __name__ == "__main__":
    main() 