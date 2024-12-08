import os
import openai
import ast
import json
from openai import OpenAI

fables_dir = "all_fables"
output_file = "characters_by_fable.json"

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY
client = OpenAI(api_key=OPENAI_API_KEY)

if os.path.exists(output_file):
    with open(output_file, "r", encoding="utf-8") as f:
        characters_by_fable = json.load(f)
else:
    characters_by_fable = {}

def analyze_fable(file_content):
    prompt = f"""
    Here is the text of a fable. Identify all the characters mentioned in this fable (only animals or principal characters of a story) 
    and return a JSON dictionary where the key is the name of the character and the value is the number of occurrences of the character in the text.

    Text:
    {file_content}

    Expected output:
    {{
        "Lion": 3,
        "Fox": 2,
        ...
    }}
    """
    try:
        response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
        output = response.choices[0].message.content
        json_start = output.find("{")
        json_end = output.rfind("}")
        if json_start != -1 and json_end != -1:
            json_data = output[json_start:json_end + 1]
            print(ast.literal_eval(json_data))
            return ast.literal_eval(json_data)
    except Exception as e:
        print(f"Error analyzing with GPT-4: {e}")
        return {}

for filename in os.listdir(fables_dir):
    if filename.endswith(".txt"):
        fable_name = os.path.splitext(filename)[0]
        if fable_name in characters_by_fable:
            print(f"Fable already analyzed: {fable_name}, skipping.")
            continue
        fable_path = os.path.join(fables_dir, filename)
        with open(fable_path, "r", encoding="utf-8") as f:
            file_content = f.read()
        print(f"Analyzing fable: {fable_name}")
        characters_dict = analyze_fable(file_content)
        characters_by_fable[fable_name] = characters_dict
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(characters_by_fable, f, indent=4, ensure_ascii=False)

print(f"Analysis complete. Results saved in {output_file}.")