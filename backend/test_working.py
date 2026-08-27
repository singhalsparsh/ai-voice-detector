# test_working.py
import requests
import os
import json

API_URL = "http://localhost:8002/api/v1/detect"
file_path = r"C:\Users\sparsh\Downloads\ttsmaker-file-2026-8-26-23-10-27.mp3"

print("🧪 Testing Working Model")
print("=" * 60)

if not os.path.exists(file_path):
    print(f"❌ File not found: {file_path}")
    exit()

try:
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, 'audio/mp3')}
        response = requests.post(API_URL, files=files, timeout=30)
    
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
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to API. Make sure the server is running.")
    print("   python working_detector.py")
except Exception as e:
    print(f"❌ Error: {e}")