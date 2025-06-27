#!/usr/bin/env python3
"""
Simple script to load your own data into the frontend
Just run: python load_my_data.py
"""

import requests
import json

# Your data (replace this with your own!)
my_data = {
    "nodes": [
        {
            "id": 1,
            "label": "My Research Topic",
            "type": "topic",
            "properties": {
                "name": "Digital Humanities",
                "field": "Computer Science + Humanities"
            }
        },
        {
            "id": 2,
            "label": "My Dataset",
            "type": "data",
            "properties": {
                "name": "Medieval Texts",
                "size": "1000 documents",
                "format": "XML"
            }
        }
    ],
    "edges": [
        {
            "source": 1,
            "target": 2,
            "label": "analyzes",
            "properties": {
                "method": "Text Analysis",
                "tool": "Python"
            }
        }
    ],
    "metadata": {
        "project_name": "My DH Project",
        "author": "Your Name",
        "course": "Digital Humanities 101",
        "date": "2024"
    }
}

# Load the data
try:
    response = requests.post('http://localhost:5000/api/data', json=my_data)
    if response.status_code == 200:
        print("✅ Your data loaded successfully!")
        print("🌐 Open http://localhost:5000 to see your frontend")
        print("📊 Your data:", json.dumps(response.json(), indent=2))
    else:
        print("❌ Failed to load data:", response.text)
except Exception as e:
    print("❌ Error:", e)
    print("💡 Make sure the Flask server is running (python app.py)") 