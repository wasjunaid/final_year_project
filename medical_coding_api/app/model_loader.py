# model_loader.py
import os
import sys
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    AutoConfig,
    pipeline
)
import torch
import warnings

warnings.filterwarnings("ignore")

MODEL_NAME = "RayyanAhmed9477/med-coding"

def load_model_and_tokenizer():
    """
    Loads Phi-3 model with multiple fallback strategies.
    Handles safetensors loading issues with robust error recovery.
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🔧 Using device: {device}")
    print(f"🔧 PyTorch version: {torch.__version__}")
    print(f"🔧 Transformers version: {sys.modules['transformers'].__version__}")
    
    # Get HuggingFace token from environment
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        print("🔑 HuggingFace token found")
    else:
        print("⚠️  No HuggingFace token - assuming public model")
    
    try:
        # ===== STEP 1: Load Tokenizer =====
        print(f"📥 Loading tokenizer: {MODEL_NAME}")
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True,
            token=hf_token,
            use_fast=True
        )
        
        # Configure tokenizer
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        if not hasattr(tokenizer, 'padding_side') or tokenizer.padding_side is None:
            tokenizer.padding_side = "left"
        
        print("✅ Tokenizer loaded successfully")
        
        # ===== STEP 2: Load Configuration =====
        print(f"📥 Loading model configuration: {MODEL_NAME}")
        config = AutoConfig.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True,
            token=hf_token
        )
        
        # Handle LongRoPE configuration
        if hasattr(config, 'rope_scaling') and config.rope_scaling is not None:
            rope_type = config.rope_scaling.get('type', 'default')
            print(f"📐 RoPE scaling type detected: {rope_type}")
            if rope_type == 'longrope':
                print("✅ LongRoPE configuration detected and supported")
        
        print(f"✅ Config loaded: {config.model_type}")
        
        # ===== STEP 3: Load Model with Multiple Strategies =====
        print(f"📥 Loading model: {MODEL_NAME}")
        print("⏳ This may take 2-5 minutes on first load...")
        
        model = None
        loading_strategies = []
        
        if device == "cuda":
            loading_strategies = [
                # Strategy 1: Standard GPU loading
                {
                    "name": "GPU Standard",
                    "params": {
                        "trust_remote_code": True,
                        "torch_dtype": torch.bfloat16,
                        "device_map": "auto",
                        "token": hf_token,
                        "low_cpu_mem_usage": True
                    }
                }
            ]
        else:
            loading_strategies = [
                # Strategy 1: CPU with safetensors (preferred)
                {
                    "name": "CPU with safetensors",
                    "params": {
                        "trust_remote_code": True,
                        "torch_dtype": torch.float32,
                        "device_map": {"": "cpu"},
                        "token": hf_token,
                        "low_cpu_mem_usage": True,
                        "use_safetensors": True
                    }
                },
                # Strategy 2: CPU without explicit safetensors
                {
                    "name": "CPU standard",
                    "params": {
                        "trust_remote_code": True,
                        "torch_dtype": torch.float32,
                        "token": hf_token,
                        "low_cpu_mem_usage": True
                    }
                },
                # Strategy 3: CPU with PyTorch weights fallback
                {
                    "name": "CPU PyTorch weights",
                    "params": {
                        "trust_remote_code": True,
                        "torch_dtype": torch.float32,
                        "token": hf_token,
                        "low_cpu_mem_usage": True,
                        "use_safetensors": False
                    }
                },
                # Strategy 4: Minimal parameters
                {
                    "name": "CPU minimal",
                    "params": {
                        "trust_remote_code": True,
                        "token": hf_token
                    }
                }
            ]
        
        # Try each loading strategy
        for idx, strategy in enumerate(loading_strategies, 1):
            try:
                print(f"\n🔄 Attempt {idx}/{len(loading_strategies)}: {strategy['name']}")
                
                model = AutoModelForCausalLM.from_pretrained(
                    MODEL_NAME,
                    config=config,
                    **strategy['params']
                )
                
                # Move to CPU explicitly if needed
                if device == "cpu" and not strategy['params'].get('device_map'):
                    model = model.to("cpu")
                
                print(f"✅ Model loaded successfully using: {strategy['name']}")
                break
                
            except Exception as e:
                print(f"❌ Strategy '{strategy['name']}' failed: {str(e)}")
                if idx == len(loading_strategies):
                    # All strategies failed
                    raise
                else:
                    print(f"⏭️  Trying next strategy...")
                    continue
        
        if model is None:
            raise RuntimeError("All loading strategies failed")
        
        # Set model to evaluation mode
        model.eval()
        
        # Disable gradients to save memory
        for param in model.parameters():
            param.requires_grad = False
        
        print("\n✅ Model fully loaded and ready!")
        
        # ===== STEP 4: Create Pipeline =====
        print("🔧 Creating text generation pipeline...")
        gen_pipeline = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=0 if device == "cuda" else -1,
            torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32
        )
        
        print("✅ Pipeline created successfully!")
        print("=" * 60)
        print("🎉 MODEL READY FOR INFERENCE")
        print("=" * 60)
        
        return gen_pipeline, tokenizer
        
    except Exception as e:
        print(f"\n❌ Error during model loading: {str(e)}")
        print("\n🔍 Diagnostic Information:")
        print(f"   - Model: {MODEL_NAME}")
        print(f"   - Device: {device}")
        print(f"   - Token available: {hf_token is not None}")
        
        import traceback
        traceback.print_exc()
        
        raise RuntimeError(
            f"Failed to load model {MODEL_NAME}. "
            "All loading strategies exhausted. "
            "This could be due to: "
            "1) Model file corruption during download, "
            "2) Insufficient memory, "
            "3) Model incompatibility. "
            "Try upgrading Space to GPU or use a different model."
        ) from e
