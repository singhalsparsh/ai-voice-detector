import requests
import json
import os

API_URL = "http://localhost:8001/api/v1/detect"
file_path = r"C:\Users\sparsh\Downloads\ttsmaker-file-2026-8-26-23-10-27.mp3"

print("🧪 Debug Testing SOTA Model")
print("=" * 60)

# Check if file exists
if not os.path.exists(file_path):
    print(f"❌ File not found: {file_path}")
    exit()

print(f"✅ File found: {file_path}")
print(f"   Size: {os.path.getsize(file_path)} bytes")

try:
    with open(file_path, 'rb') as f:
        print("📤 Sending request...")
        files = {'file': (os.path.basename(file_path), f, 'audio/mp3')}
        response = requests.post(API_URL, files=files, timeout=30)
    
    print(f"📥 Response status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n📊 Result:")
        print(f"   {'🤖 AI' if result['is_ai'] else '👤 REAL'}")
        print(f"   Confidence: {result['confidence']:.1f}%")
        print(f"   Model: {result['model_used']}")
        print(f"   Duration: {result['duration_seconds']:.2f}s")
        
        print("\n📈 Metrics:")
        for key, value in result['metrics'].items():
            print(f"   {key}: {value}")
        
        if result['is_ai']:
            print("\n✅ CORRECT: TTS detected as AI")
        else:
            print("\n❌ WRONG: TTS misclassified as REAL")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to API. Make sure the server is running.")
    print("   python new_main.py")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()