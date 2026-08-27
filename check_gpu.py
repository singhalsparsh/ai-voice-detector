import torch

print("=" * 50)
print("🔍 GPU Verification")
print("=" * 50)

print(f"PyTorch Version: {torch.__version__}")
print(f"CUDA Available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA Version: {torch.version.cuda}")
    print(f"GPU Count: {torch.cuda.device_count()}")
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print("✅ Your GPU is ready for training!")
else:
    print("❌ CUDA is NOT available. Using CPU.")
    print("\nTroubleshooting:")
    print("1. Run: nvidia-smi (check if GPU is detected)")
    print("2. Reinstall PyTorch with CUDA:")
    print("   pip uninstall torch torchaudio -y")
    print("   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121")
    print("3. Restart your terminal and try again")