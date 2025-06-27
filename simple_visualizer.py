#!/usr/bin/env python3
"""
Simple Visualizer - One function to visualize any CSV data
Usage: visualize("path/to/file.csv") or visualize("https://url/to/file.csv")
"""

import pandas as pd
import requests
import json
import subprocess
import sys
import argparse
from pathlib import Path
from urllib.parse import urlparse
import re

def install_if_needed(package):
    """Install package if not already installed"""
    try:
        __import__(package)
    except ImportError:
        print(f"📦 Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def download_from_url(url):
    """Download CSV from URL"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Check if it's a Box link (returns HTML instead of CSV)
        if 'box.com' in url and '<!DOCTYPE html>' in response.text:
            print("📦 Detected Box link - trying to extract direct download URL...")
            
            # Try to find the direct download link in the HTML
            download_patterns = [
                r'href="([^"]*\.csv[^"]*)"',
                r'data-download-url="([^"]*)"',
                r'"downloadUrl":"([^"]*)"',
                r'"url":"([^"]*\.csv[^"]*)"'
            ]
            
            for pattern in download_patterns:
                matches = re.findall(pattern, response.text)
                if matches:
                    direct_url = matches[0]
                    if not direct_url.startswith('http'):
                        # Make it absolute if it's relative
                        direct_url = 'https://app.box.com' + direct_url
                    
                    print(f"🔗 Found direct download URL: {direct_url}")
                    response = requests.get(direct_url)
                    response.raise_for_status()
                    break
            else:
                print("❌ Could not extract direct download URL from Box page")
                print("💡 Try using the direct download link instead")
                return None
        
        # Save to temporary file
        temp_file = "temp_data.csv"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"✅ Downloaded data from {url}")
        return temp_file
    except Exception as e:
        print(f"❌ Failed to download from {url}: {e}")
        return None

def visualize(file_path_or_url, server_url="http://localhost:8000", node_type="data"):
    """
    Visualize CSV data in the frontend with one function call!
    
    Args:
        file_path_or_url (str): Path to CSV file or URL
        server_url (str): Flask server URL (default: http://localhost:8000)
        node_type (str): Type of nodes (default: "data")
    
    Examples:
        visualize("DataManagement/nodes.csv")
        visualize("https://app.box.com/s/yqz9v77yx69seqrkuoj7ys3rci2fajob")
        visualize("my_data.csv", node_type="persons")
    """
    
    # Install required packages
    install_if_needed('pandas')
    install_if_needed('requests')
    
    print(f"🚀 Loading data from: {file_path_or_url}")
    
    # Determine if it's a URL or file path
    if file_path_or_url.startswith(('http://', 'https://')):
        csv_file = download_from_url(file_path_or_url)
        if not csv_file:
            return False
    else:
        csv_file = file_path_or_url
    
    try:
        # Load CSV data with flexible parsing
        try:
            df = pd.read_csv(csv_file)
        except:
            # Try different delimiters
            for delimiter in [',', ';', '\t', '|']:
                try:
                    df = pd.read_csv(csv_file, delimiter=delimiter)
                    print(f"✅ Used delimiter: '{delimiter}'")
                    break
                except:
                    continue
            else:
                # Try reading as fixed-width or other format
                try:
                    df = pd.read_csv(csv_file, engine='python')
                except:
                    # Last resort: read as text and parse manually
                    with open(csv_file, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    
                    # Find the delimiter by analyzing the first few lines
                    if len(lines) > 0:
                        first_line = lines[0]
                        for delimiter in [',', ';', '\t', '|']:
                            if delimiter in first_line:
                                df = pd.read_csv(csv_file, delimiter=delimiter, on_bad_lines='skip')
                                print(f"✅ Used delimiter: '{delimiter}' (with error handling)")
                                break
                        else:
                            raise Exception("Could not determine CSV format")
                    else:
                        raise Exception("Empty file")
        
        print(f"✅ Loaded {len(df)} rows from CSV")
        
        # Convert to frontend format
        nodes = []
        for idx, row in df.iterrows():
            # Use 'person name' column if it exists, otherwise first column
            if 'person name' in df.columns:
                label = str(row['person name'])
            elif 'name' in df.columns:
                label = str(row['name'])
            else:
                label = str(row.iloc[0])
            
            # Use 'TYPE' column if it exists, otherwise use provided node_type
            if 'TYPE' in df.columns:
                node_type = str(row['TYPE']).lower()
            else:
                node_type = node_type
            
            node = {
                "id": idx + 1,
                "label": label,
                "type": node_type,
                "properties": {
                    "row_index": idx,
                    "source": file_path_or_url
                }
            }
            
            # Add all other columns as properties
            for col in df.columns:
                if col not in ['person name', 'name', 'label']:
                    node["properties"][col] = str(row[col])
            
            nodes.append(node)
        
        # Create simple edges (connect each node to next few nodes)
        edges = []
        for i in range(len(nodes)):
            # Connect to next 3 nodes (or fewer if at end)
            for j in range(i + 1, min(i + 4, len(nodes))):
                edges.append({
                    "source": nodes[i]["id"],
                    "target": nodes[j]["id"],
                    "label": "related",
                    "properties": {
                        "type": "sequential",
                        "source": file_path_or_url
                    }
                })
        
        # Prepare data for frontend
        data = {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "project_name": f"Visualization of {Path(csv_file).stem}",
                "source": file_path_or_url,
                "node_type": node_type,
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "columns": list(df.columns)
            }
        }
        
        # Send to frontend
        print("🌐 Sending to frontend...")
        response = requests.post(
            f"{server_url}/api/data",
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Data visualized successfully!")
            print(f"📱 Open {server_url} to see your visualization")
            print(f"📊 {len(nodes)} nodes, {len(edges)} edges")
            
            # Show sample data
            print("\n🔍 Sample nodes:")
            for i, node in enumerate(nodes[:3]):
                print(f"   {i+1}. {node['label']}")
            if len(nodes) > 3:
                print(f"   ... and {len(nodes) - 3} more")
            
            return True
        else:
            print(f"❌ Failed to send data: {response.status_code}")
            return False
            
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Clean up temporary file if it was downloaded
        if file_path_or_url.startswith(('http://', 'https://')) and Path("temp_data.csv").exists():
            Path("temp_data.csv").unlink()

# Convenience functions for common use cases
def visualize_persons(file_path_or_url, server_url="http://localhost:8000"):
    """Visualize person data"""
    return visualize(file_path_or_url, server_url, "person")

def visualize_places(file_path_or_url, server_url="http://localhost:8000"):
    """Visualize place data"""
    return visualize(file_path_or_url, server_url, "place")

def visualize_essay(book_essay, data_type="persons", server_url="http://localhost:8000"):
    """
    Visualize essay data with naming convention (e.g., "02_05" for book 2, essay 5)
    
    Examples:
        visualize_essay("02_05", "persons")
        visualize_essay("01_15", "animals")
    """
    file_path = f"DataManagement/{book_essay}_{data_type}.csv"
    return visualize(file_path, server_url, data_type)

def visualize_multiple_essays(file_paths, server_url="http://localhost:8000"):
    """
    Visualize multiple essay CSV files together, with each essay as a node
    
    Args:
        file_paths (list): List of CSV file paths
        server_url (str): Flask server URL
    
    Example:
        visualize_multiple_essays([
            "/Users/student/Downloads/essays 02_03 persons.csv",
            "/Users/student/Downloads/essays 02_04 persons.csv"
        ])
    """
    
    # Install required packages
    install_if_needed('pandas')
    install_if_needed('requests')
    
    print(f"🚀 Loading {len(file_paths)} essay files...")
    
    nodes = []
    edges = []
    node_id = 1
    
    for file_path in file_paths:
        try:
            # Load CSV data
            df = pd.read_csv(file_path)
            print(f"✅ Loaded {len(df)} persons from {Path(file_path).name}")
            
            # Create essay node
            essay_name = Path(file_path).stem  # Get filename without extension
            # Add book name to essay label if it's in a book folder
            book_folder = Path(file_path).parent.name
            if book_folder.startswith("Book"):
                essay_label = f"{book_folder} - {essay_name}"
            else:
                essay_label = essay_name
            
            essay_node = {
                "id": node_id,
                "label": essay_label,
                "type": "essay",
                "properties": {
                    "file_path": file_path,
                    "book": book_folder if book_folder.startswith("Book") else "unknown",
                    "essay_name": essay_name,
                    "total_persons": len(df),
                    "source": "multiple_essays"
                }
            }
            nodes.append(essay_node)
            
            # Create person nodes for this essay
            person_start_id = node_id + 1
            for idx, row in df.iterrows():
                # Use 'person name' column if it exists, otherwise first column
                if 'person name' in df.columns:
                    label = str(row['person name'])
                elif 'name' in df.columns:
                    label = str(row['name'])
                else:
                    label = str(row.iloc[0])
                
                person_node = {
                    "id": person_start_id + idx,
                    "label": label,
                    "type": "person",
                    "properties": {
                        "essay": essay_name,
                        "row_index": idx,
                        "source": file_path
                    }
                }
                
                # Add all other columns as properties
                for col in df.columns:
                    if col not in ['person name', 'name', 'label']:
                        person_node["properties"][col] = str(row[col])
                
                nodes.append(person_node)
                
                # Connect person to essay
                edges.append({
                    "source": essay_node["id"],
                    "target": person_node["id"],
                    "label": "contains",
                    "properties": {
                        "type": "essay_person",
                        "source": file_path
                    }
                })
            
            node_id = person_start_id + len(df)
            
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            continue
    
    # Create connections between essays (based on shared persons)
    print("🔗 Creating connections between essays...")
    essay_nodes = [n for n in nodes if n["type"] == "essay"]
    person_nodes = [n for n in nodes if n["type"] == "person"]
    
    for i, essay1 in enumerate(essay_nodes):
        for j, essay2 in enumerate(essay_nodes[i+1:], i+1):
            # Find persons in essay1
            persons1 = [p for p in person_nodes if p["properties"]["essay"] == essay1["label"]]
            # Find persons in essay2
            persons2 = [p for p in person_nodes if p["properties"]["essay"] == essay2["label"]]
            
            # Check for shared persons
            shared_count = 0
            for p1 in persons1:
                for p2 in persons2:
                    if p1["label"] == p2["label"]:
                        shared_count += 1
                        # Connect shared persons
                        edges.append({
                            "source": p1["id"],
                            "target": p2["id"],
                            "label": "same_person",
                            "properties": {
                                "type": "shared_person",
                                "essay1": essay1["label"],
                                "essay2": essay2["label"]
                            }
                        })
            
            # Connect essays if they share persons
            if shared_count > 0:
                edges.append({
                    "source": essay1["id"],
                    "target": essay2["id"],
                    "label": "shares_persons",
                    "properties": {
                        "type": "essay_connection",
                        "shared_count": shared_count
                    }
                })
    
    # Prepare data for frontend
    data = {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "project_name": f"Multiple Essays Visualization",
            "source": "multiple_files",
            "total_essays": len(essay_nodes),
            "total_persons": len(person_nodes),
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "files": [Path(f).name for f in file_paths],
            "node_types": {
                "essay": "Essay",
                "person": "Person"
            },
            "statistics": {
                "essays": len(essay_nodes),
                "persons": len(person_nodes),
                "links": len(edges)
            }
        }
    }
    
    # Send to frontend
    print("🌐 Sending to frontend...")
    response = requests.post(
        f"{server_url}/api/data",
        json=data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        print("✅ Multiple essays visualized successfully!")
        print(f"📱 Open {server_url} to see your visualization")
        print(f"📊 {len(nodes)} nodes ({len(essay_nodes)} essays, {len(person_nodes)} persons), {len(edges)} edges")
        
        # Show sample data
        print("\n🔍 Essays:")
        for essay in essay_nodes:
            print(f"   📚 {essay['label']}")
        
        print("\n🔍 Sample persons:")
        for i, person in enumerate(person_nodes[:5]):
            print(f"   👤 {person['label']} ({person['properties']['essay']})")
        if len(person_nodes) > 5:
            print(f"   ... and {len(person_nodes) - 5} more persons")
        
        return True
    else:
        print(f"❌ Failed to send data: {response.status_code}")
        return False

def visualize_book2_essays(folder_path="/Users/student/Downloads", server_url="http://localhost:8000"):
    """
    Visualize all Book 2 essays from a folder
    
    Args:
        folder_path (str): Path to folder containing essay files
        server_url (str): Flask server URL
    
    Example:
        visualize_book2_essays("/Users/student/Downloads")
    """
    
    # Find all Book 2 essay files
    essay_files = []
    for i in range(1, 6):  # essays 02_01 to 02_05
        filename = f"essays 02_{i:02d} persons.csv"
        file_path = Path(folder_path) / filename
        if file_path.exists():
            essay_files.append(str(file_path))
            print(f"✅ Found: {filename}")
        else:
            print(f"❌ Missing: {filename}")
    
    if not essay_files:
        print("❌ No Book 2 essay files found!")
        return False
    
    print(f"📚 Loading {len(essay_files)} Book 2 essays...")
    return visualize_multiple_essays(essay_files, server_url)

def visualize_book_essays(book_folder_path, data_type="persons", server_url="http://localhost:8000"):
    """
    Visualize all essays from any book folder
    
    Args:
        book_folder_path (str): Path to book folder (e.g., "/path/to/Book 1")
        data_type (str): Type of data to visualize ("persons" or "places")
        server_url (str): Flask server URL
    
    Example:
        visualize_book_essays("/Users/student/Programming Historian lesson/Book 1", "persons")
        visualize_book_essays("/Users/student/Programming Historian lesson/Book 2", "places")
    """
    
    book_path = Path(book_folder_path)
    if not book_path.exists():
        print(f"❌ Book folder not found: {book_folder_path}")
        return False
    
    # Find all essay files for the specified data type
    essay_files = []
    pattern = f"essays *_* {data_type}.csv"
    
    for file_path in book_path.glob(pattern):
        essay_files.append(str(file_path))
        print(f"✅ Found: {file_path.name}")
    
    if not essay_files:
        print(f"❌ No essay files found for {data_type} in {book_folder_path}")
        print(f"💡 Looking for files matching: {pattern}")
        return False
    
    print(f"📚 Loading {len(essay_files)} essays from {book_path.name}...")
    return visualize_multiple_essays(essay_files, server_url)

def visualize_all_books(base_folder_path, data_type="persons", server_url="http://localhost:8000"):
    """
    Visualize essays from all books in a folder
    
    Args:
        base_folder_path (str): Path to folder containing Book 1, Book 2, etc.
        data_type (str): Type of data to visualize ("persons" or "places")
        server_url (str): Flask server URL
    
    Example:
        visualize_all_books("/Users/student/Programming Historian lesson", "persons")
    """
    
    base_path = Path(base_folder_path)
    if not base_path.exists():
        print(f"❌ Base folder not found: {base_folder_path}")
        return False
    
    # Find all book folders
    book_folders = []
    for item in base_path.iterdir():
        if item.is_dir() and item.name.startswith("Book"):
            book_folders.append(item)
    
    if not book_folders:
        print(f"❌ No book folders found in {base_folder_path}")
        return False
    
    print(f"📚 Found {len(book_folders)} book folders:")
    for book in book_folders:
        print(f"   📖 {book.name}")
    
    # Collect all essay files from all books
    all_essay_files = []
    for book_folder in book_folders:
        pattern = f"essays *_* {data_type}.csv"
        for file_path in book_folder.glob(pattern):
            all_essay_files.append(str(file_path))
            print(f"✅ Found: {book_folder.name}/{file_path.name}")
    
    if not all_essay_files:
        print(f"❌ No essay files found for {data_type} in any book")
        return False
    
    print(f"📚 Loading {len(all_essay_files)} essays from all books...")
    return visualize_multiple_essays(all_essay_files, server_url)

def main():
    """Command-line interface"""
    parser = argparse.ArgumentParser(description="Network Visualization Tool")
    parser.add_argument("--visualize", help="Visualize a single CSV file")
    parser.add_argument("--visualize-essay", help="Visualize a specific essay (e.g., 02_05)")
    parser.add_argument("--visualize-book", help="Visualize all essays from a book folder")
    parser.add_argument("--visualize-all-books", help="Visualize all essays from all books in a folder")
    parser.add_argument("--visualize-multiple-essays", nargs="+", help="Visualize multiple specific essays")
    parser.add_argument("--data-type", default="persons", choices=["persons", "places"], help="Type of data to visualize")
    parser.add_argument("--server", default="http://localhost:8000", help="Server URL")
    
    args = parser.parse_args()
    
    if args.visualize:
        visualize(args.visualize, args.server)
    elif args.visualize_essay:
        visualize_essay(args.visualize_essay, args.data_type, args.server)
    elif args.visualize_book:
        visualize_book_essays(args.visualize_book, args.data_type, args.server)
    elif args.visualize_all_books:
        visualize_all_books(args.visualize_all_books, args.data_type, args.server)
    elif args.visualize_multiple_essays:
        visualize_multiple_essays(args.visualize_multiple_essays, args.server)
    else:
        print("📖 Simple Visualizer Ready!")
        print("Usage examples:")
        print("  visualize('path/to/file.csv')")
        print("  visualize('https://url/to/file.csv')")
        print("  visualize_essay('02_05', 'persons')")
        print("  visualize_multiple_essays([")
        print("      '/Users/student/Downloads/essays 02_03 persons.csv',")
        print("      '/Users/student/Downloads/essays 02_04 persons.csv'")
        print("  ])")
        print("  visualize_book2_essays('/Users/student/Downloads')")
        print("  visualize_book_essays('/Users/student/Programming Historian lesson/Book 1', 'persons')")
        print("  visualize_all_books('/Users/student/Programming Historian lesson', 'persons')")
        print("\nCommand-line usage:")
        print("  python simple_visualizer.py --visualize-book '/path/to/Book 1'")
        print("  python simple_visualizer.py --visualize-all-books '/path/to/folder'")
        print("  python simple_visualizer.py --visualize-essay 02_05")

# Example usage
if __name__ == "__main__":
    # Examples - uncomment the one you want to use:
    
    # 1. Visualize local CSV file
    # visualize("DataManagement/nodes.csv")
    
    # 2. Visualize from URL
    # visualize("https://app.box.com/s/yqz9v77yx69seqrkuoj7ys3rci2fajob")
    
    # 3. Visualize essay data
    # visualize_essay("02_05", "persons")
    
    # 4. Visualize with custom type
    # visualize("my_data.csv", node_type="custom")
    
    main() 