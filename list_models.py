import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

with open('models.txt', 'w') as f:
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(m.name + '\n')
                print(m.name)
    except Exception as e:
        f.write(f"Error: {e}\n")
        print(f"Error: {e}")
