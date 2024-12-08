import json
from collections import Counter

def top_10_animals(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        characters_by_fable = json.load(f)

    animal_counter = Counter()
    EXCLUDE_WORDS = ["man"]

    for fable, characters in characters_by_fable.items():
        for character in characters.keys():
            if character.lower() not in EXCLUDE_WORDS:
                animal_counter[character] += 1

    top_10 = animal_counter.most_common(10)
    return top_10

file_path = "characters_by_fable.json"
top_animals = top_10_animals(file_path)
print("The 10 most frequent animals:")
for animal, count in top_animals:
    print(f"{animal}: {count} fables")

def top_10_characters(file_path, exclude_words=None):
    with open(file_path, "r", encoding="utf-8") as f:
        characters_by_fable = json.load(f)

    exclude_words = set(word.lower() for word in (exclude_words or []))
    character_fables = {}

    for fable, characters in characters_by_fable.items():
        for character in characters.keys():
            if character.lower() not in exclude_words:
                if character not in character_fables:
                    character_fables[character] = []
                character_fables[character].append(fable)

    character_counts = Counter({character: len(fables) for character, fables in character_fables.items()})
    top_10 = character_counts.most_common(10)
    return {character: character_fables[character] for character, _ in top_10}

file_path = "characters_by_fable.json"
exclude_words = ["man"]
top_characters = top_10_characters(file_path, exclude_words)

print(top_characters)