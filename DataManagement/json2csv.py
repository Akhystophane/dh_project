import json
import csv

input_file = "characters_by_fable.json"
nodes_file = "nodes.csv"
edges_file = "edges.csv"

with open(input_file, "r", encoding="utf-8") as f:
    characters_by_fable = json.load(f)

nodes_set = set()
edges_list = []

for fable_name, characters in characters_by_fable.items():
    nodes_set.add(fable_name)
    for character, weight in characters.items():
        nodes_set.add(character)
        edges_list.append({"source": fable_name, "target": character, "weight": weight})

with open(nodes_file, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "label"])
    writer.writeheader()
    for node in nodes_set:
        writer.writerow({"id": node, "label": node})

with open(edges_file, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["source", "target", "weight"])
    writer.writeheader()
    for edge in edges_list:
        writer.writerow(edge)

print(f"Files generated: {nodes_file} and {edges_file}")