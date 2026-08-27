# check_files.py
from huggingface_hub import list_repo_files

print("📁 Checking files in repository: koyelog/deepfake-voice-detector-sota")
print("=" * 60)

try:
    files = list_repo_files("koyelog/deepfake-voice-detector-sota")
    print(f"\n✅ Found {len(files)} files:")
    for f in files:
        print(f"  - {f}")
        
    # Check for model files
    model_extensions = ['.safetensors', '.bin', '.pt', '.pth', '.pkl']
    model_files = [f for f in files if any(f.endswith(ext) for ext in model_extensions)]
    
    print(f"\n📦 Model files found ({len(model_files)}):")
    for f in model_files:
        print(f"  ✅ {f}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Try running: pip install huggingface-hub")