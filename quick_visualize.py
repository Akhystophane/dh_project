#!/usr/bin/env python3
"""
Quick Visualization Examples - Just a few lines to visualize any data!
"""

from simple_visualizer import visualize, visualize_essay, visualize_book_essays, visualize_all_books

# Example 1: Visualize local CSV file
# visualize("DataManagement/nodes.csv")

# Example 2: Visualize from URL
# visualize("https://app.box.com/s/yqz9v77yx69seqrkuoj7ys3rci2fajob")

# Example 3: Visualize essay data (if you have essay CSV files)
# visualize_essay("02_05", "persons")

# Example 4: Visualize with custom node type
# visualize("my_data.csv", node_type="custom")

# Example 5: Visualize all essays from Book 2 (persons)
# visualize_book_essays("/Users/student/Programming Historian lesson/Book 2", "persons")

# Example 6: Visualize all essays from Book 2 (places)
# visualize_book_essays("/Users/student/Programming Historian lesson/Book 2", "places")

# Example 7: Visualize all books at once (persons)
# visualize_all_books("/Users/student/Programming Historian lesson", "persons")

# Example 8: Visualize all books at once (places)
# visualize_all_books("/Users/student/Programming Historian lesson", "places")

print("📖 Multi-Book Visualizer Ready!")
print("\n🎯 Usage examples:")
print("  # Single book (persons):")
print("  visualize_book_essays('/path/to/Book 2', 'persons')")
print("\n  # Single book (places):")
print("  visualize_book_essays('/path/to/Book 2', 'places')")
print("\n  # All books (persons):")
print("  visualize_all_books('/path/to/Programming Historian lesson', 'persons')")
print("\n  # All books (places):")
print("  visualize_all_books('/path/to/Programming Historian lesson', 'places')")
print("\n  # Single file:")
print("  visualize('/path/to/essays 02_01 persons.csv')") 