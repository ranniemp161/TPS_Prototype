#!/bin/bash
# Installs the editing stack on the pod, then marks READY (Opus, 27 Oct 2026).
set -x
cd /workspace
PIP="python3 -m pip install --no-cache-dir"
$PIP -U "git+https://github.com/huggingface/diffusers" transformers accelerate safetensors sentencepiece protobuf pillow "huggingface_hub[hf_transfer]" \
  || $PIP --break-system-packages -U "git+https://github.com/huggingface/diffusers" transformers accelerate safetensors sentencepiece protobuf pillow "huggingface_hub[hf_transfer]"
python3 -c "import diffusers, transformers, torch; print('diffusers', diffusers.__version__, 'transformers', transformers.__version__, 'torch', torch.__version__, 'cuda', torch.cuda.is_available())" && touch /workspace/READY
