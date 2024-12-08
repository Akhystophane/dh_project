import os
import re
import string

input_file = "fables_full.txt"
output_dir = "."
fable_count = 0

fable_start_pattern = re.compile(r"^FABLE\s+([IVXLCDM]+)\.\s*$", re.IGNORECASE)

in_fable = False
fable_text = []
current_title = None

def clean_filename(s: str) -> str:
    translator = str.maketrans('', '', string.punctuation)
    s = s.translate(translator)
    s = s.strip().replace(" ", "_")
    return s

def save_fable(number, title, lines):
    title_clean = clean_filename(title)
    filename = f"{number}_{title_clean}.txt"
    with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as out_f:
        out_f.write("".join(lines))

with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

i = 0
while i < len(lines):
    line = lines[i]
    match = fable_start_pattern.match(line.strip())
    if match:
        if in_fable and current_title and fable_text:
            fable_count += 1
            save_fable(fable_count, current_title, fable_text)
            fable_text = []
        in_fable = True
        current_title = None
        i += 1
        while i < len(lines) and not lines[i].strip():
            i += 1
        if i < len(lines):
            current_title_line = lines[i].strip()
            current_title = current_title_line
            i += 1
        fable_text = []
        continue
    else:
        if in_fable:
            fable_text.append(line)
    i += 1

if in_fable and current_title and fable_text:
    fable_count += 1
    save_fable(fable_count, current_title, fable_text)