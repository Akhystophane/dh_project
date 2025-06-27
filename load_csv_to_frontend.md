# 📊 Load CSV Data to Frontend - Quick Guide

This guide shows you how to load your CSV data into the frontend with just a few lines of Python code.

## 🚀 Quick Start

### 1. Install Dependencies
```python
# Install required packages
import subprocess
import sys

def install_packages():
    packages = ['pandas', 'requests']
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed")

install_packages()
```

### 2. Import Libraries
```python
import pandas as pd
import requests
import json
from pathlib import Path
```

## 📁 Load Your CSV Data

### Method 1: Load Specific Essay (e.g., 02_05 persons.csv)
```python
def load_essay_data(book_essay, data_type="persons"):
    """
    Load data for a specific essay (e.g., "02_05" for book 2, essay 5)
    
    Args:
        book_essay (str): Essay identifier like "02_05"
        data_type (str): Type of data ("persons", "places", "objects", etc.)
    """
    
    # Construct file path
    csv_file = f"DataManagement/{book_essay}_{data_type}.csv"
    
    try:
        # Load CSV data
        df = pd.read_csv(csv_file)
        
        # Convert to frontend format
        nodes = []
        for idx, row in df.iterrows():
            node = {
                "id": idx + 1,
                "label": row['label'] if 'label' in row else str(row.iloc[0]),
                "type": data_type,
                "properties": {
                    "book": book_essay.split('_')[0],
                    "essay": book_essay.split('_')[1],
                    "data_type": data_type
                }
            }
            nodes.append(node)
        
        # Create edges (connections between nodes)
        edges = []
        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                edges.append({
                    "source": nodes[i]["id"],
                    "target": nodes[j]["id"],
                    "label": "related",
                    "properties": {
                        "essay": book_essay,
                        "type": "co-occurrence"
                    }
                })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "project_name": f"Essay {book_essay} Analysis",
                "book": book_essay.split('_')[0],
                "essay": book_essay.split('_')[1],
                "data_type": data_type,
                "total_nodes": len(nodes),
                "total_edges": len(edges)
            }
        }
        
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return None
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None

# Example usage
data = load_essay_data("02_05", "persons")
if data:
    print(f"✅ Loaded {len(data['nodes'])} nodes and {len(data['edges'])} edges")
```

### Method 2: Load Multiple Essays
```python
def load_multiple_essays(essays_list):
    """
    Load data from multiple essays
    
    Args:
        essays_list (list): List of essay identifiers like ["02_05", "03_12"]
    """
    
    all_nodes = []
    all_edges = []
    node_id_counter = 1
    
    for essay in essays_list:
        # Try different data types
        for data_type in ["persons", "places", "objects", "animals"]:
            essay_data = load_essay_data(essay, data_type)
            if essay_data:
                # Update node IDs to be unique
                for node in essay_data['nodes']:
                    node['id'] = node_id_counter
                    node_id_counter += 1
                    all_nodes.append(node)
                
                # Update edge source/target IDs
                for edge in essay_data['edges']:
                    edge['source'] = edge['source'] + len(all_nodes) - len(essay_data['nodes'])
                    edge['target'] = edge['target'] + len(all_nodes) - len(essay_data['nodes'])
                    all_edges.append(edge)
    
    return {
        "nodes": all_nodes,
        "edges": all_edges,
        "metadata": {
            "project_name": f"Multi-Essay Analysis",
            "essays": essays_list,
            "total_nodes": len(all_nodes),
            "total_edges": len(all_edges)
        }
    }

# Example usage
essays = ["02_05", "03_12", "01_15"]
data = load_multiple_essays(essays)
print(f"✅ Loaded {len(data['nodes'])} total nodes and {len(data['edges'])} total edges")
```

### Method 3: Load from Existing CSV Files
```python
def load_from_existing_csv():
    """
    Load data from the existing nodes.csv and edges.csv files
    """
    
    try:
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
                "total_edges": len(edges)
            }
        }
        
    except Exception as e:
        print(f"❌ Error loading existing CSV: {e}")
        return None

# Example usage
data = load_from_existing_csv()
if data:
    print(f"✅ Loaded {len(data['nodes'])} nodes and {len(data['edges'])} edges from existing CSV")
```

## 🌐 Send Data to Frontend

### Send to Flask API
```python
def send_to_frontend(data, server_url="http://localhost:5000"):
    """
    Send data to the frontend via Flask API
    
    Args:
        data (dict): The data to send
        server_url (str): Flask server URL
    """
    
    try:
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

# Example usage
result = send_to_frontend(data)
if result:
    print("🎉 Your data is now visible in the frontend!")
```

## 🎯 Complete Example

```python
# Complete workflow - load essay data and display in frontend
def load_and_display_essay(book_essay, data_type="persons"):
    """
    Complete workflow: load essay data and display in frontend
    """
    
    print(f"📖 Loading essay {book_essay} ({data_type})...")
    
    # Load data
    data = load_essay_data(book_essay, data_type)
    if not data:
        print("❌ Failed to load data")
        return
    
    print(f"✅ Loaded {len(data['nodes'])} nodes and {len(data['edges'])} edges")
    
    # Send to frontend
    result = send_to_frontend(data)
    if result:
        print("🎉 Essay data is now visible in the frontend!")
        print(f"📊 Metadata: {data['metadata']}")

# Usage examples
load_and_display_essay("02_05", "persons")  # Book 2, Essay 5, persons
load_and_display_essay("01_15", "animals")  # Book 1, Essay 15, animals
load_and_display_essay("03_12", "places")   # Book 3, Essay 12, places
```

## 🔧 Customization

### Add Custom Properties
```python
def add_custom_properties(data, custom_props):
    """
    Add custom properties to all nodes
    """
    for node in data['nodes']:
        node['properties'].update(custom_props)
    return data

# Example
custom_props = {
    "author": "Your Name",
    "course": "Digital Humanities",
    "date": "2024"
}
data = add_custom_properties(data, custom_props)
```

### Filter Data
```python
def filter_nodes_by_type(data, node_type):
    """
    Filter nodes by type
    """
    filtered_nodes = [node for node in data['nodes'] if node['type'] == node_type]
    # Update edges accordingly
    node_ids = {node['id'] for node in filtered_nodes}
    filtered_edges = [edge for edge in data['edges'] 
                     if edge['source'] in node_ids and edge['target'] in node_ids]
    
    return {
        "nodes": filtered_nodes,
        "edges": filtered_edges,
        "metadata": data['metadata']
    }

# Example
persons_only = filter_nodes_by_type(data, "persons")
```

## 🚨 Troubleshooting

### Check if Flask Server is Running
```python
def check_server_status(server_url="http://localhost:5000"):
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

# Check before sending data
if check_server_status():
    send_to_frontend(data)
```

### Save Data to File
```python
def save_data_to_file(data, filename="my_data.json"):
    """
    Save data to JSON file for backup
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✅ Data saved to {filename}")

# Example
save_data_to_file(data, "essay_02_05_data.json")
```

---

## 🎓 For Your Course

This setup allows students to:
1. **Load any essay data** with simple function calls
2. **Visualize relationships** in the 3D network
3. **Compare different essays** and data types
4. **Customize the analysis** with their own properties
5. **Export and share** their findings

Perfect for demonstrating digital humanities methods! 🚀 