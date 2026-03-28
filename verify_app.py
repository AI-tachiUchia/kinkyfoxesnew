import requests
import json
import time
import subprocess
import sys
import os

# Start the Flask app in a separate process
app_process = subprocess.Popen([sys.executable, 'app.py'], cwd=r'c:\Users\timcl\Desktop\kinkyfoxes')

print("Waiting for app to start...")
time.sleep(10)

url = 'http://127.0.0.1:5000/generate_game'
data = {'scenario': 'A romantic dinner in Paris'}
headers = {'Content-Type': 'application/json'}

try:
    print(f"Testing {url} with data: {data}")
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        print("Success! Game generated:")
        print(response.json().get('game', 'No game key found')[:100] + "...")
    else:
        print(f"Failed with status code {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
finally:
    # Terminate the app process
    app_process.terminate()
    print("App terminated.")
