# AI Image Generation Master Research

**Last Updated:** 2026-02-06
**Purpose:** Comprehensive research for mass art asset creation (1590+ exercise icons, UI elements, avatars)
**Budget:** Cost-conscious with emphasis on time efficiency

---

## Executive Summary

### Best Recommendation for GymRats

**Primary Strategy: Hybrid Approach**

For 1590 exercise icons with the established "minimal silhouette with accent" style:

| Phase | Tool | Cost Estimate | Time | Quality |
|-------|------|---------------|------|---------|
| **Phase 1: Test Batch (50 icons)** | Stability AI API via MCP | ~$2.50 | 1 hour | High |
| **Phase 2: Full Generation (1540 icons)** | Local SD/Flux via DiffuGen | $0 (electricity) | 24-48 hrs | High |
| **Fallback** | fal.ai Flux API | ~$50 | 4 hours | High |

**Why This Approach:**
1. **Test with API first** - Validate prompts work before committing to full batch
2. **Local generation for bulk** - Zero marginal cost per image after hardware
3. **API fallback** - If local quality insufficient, fal.ai offers best price/quality

**Total Estimated Cost for 1590 Icons:** $0-$65 depending on approach chosen

---

## MCP Servers for Claude Terminal

### Available MCP Servers

#### 1. Stability AI MCP Server (Recommended for Quality)

**Repository:** [github.com/tadasant/mcp-server-stability-ai](https://github.com/tadasant/mcp-server-stability-ai)

**Installation:**
```bash
# Via Smithery (automated)
npx @smithery/cli install mcp-server-stability-ai --client claude

# Manual - add to claude_desktop_config.json
{
  "mcpServers": {
    "stability-ai": {
      "command": "npx",
      "args": ["-y", "mcp-server-stability-ai"],
      "env": {
        "STABILITY_AI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

**Supported Features:**
| Tool | Function | Est. Cost |
|------|----------|-----------|
| generate-image | Create images from text prompts | $0.03 |
| generate-image-sd35 | Advanced SD 3.5 generation | $0.04-$0.07 |
| remove-background | Strip backgrounds automatically | $0.02 |
| upscale-fast | 4x resolution enhancement | $0.01 |
| upscale-creative | Up to 4K enhancement | $0.25 |

**Batch Processing:** YES - through scripted API calls
**Pricing Model:** Pay-per-image via Stability AI credits
**Quality Assessment:** A (excellent for icons and silhouettes)

---

#### 2. Image Gen MCP (OpenAI + Google)

**Repository:** [github.com/lansespirit/image-gen-mcp](https://github.com/lansespirit/image-gen-mcp)

**Installation:**
```bash
git clone https://github.com/lansespirit/image-gen-mcp.git
cd image-gen-mcp
uv sync
cp .env.example .env
# Add API keys to .env file
```

**Configuration:**
```bash
# For OpenAI (DALL-E, GPT-image-1)
PROVIDERS__OPENAI__API_KEY=sk-...

# For Google Imagen
PROVIDERS__GEMINI__API_KEY=/path/to/service-account.json
```

**Supported Models:**
- OpenAI: gpt-image-1, dall-e-3, dall-e-2
- Google: imagen-4, imagen-4-ultra, imagen-3

**Batch Processing:** YES - supports multiple outputs
**Pricing Model:** Pay-per-image via OpenAI/Google billing
**Quality Assessment:** A (gpt-image-1), B+ (DALL-E 3)

---

#### 3. DiffuGen (Local/Free - Best for Bulk)

**Repository:** [github.com/CLOUDWERX-DEV/DiffuGen](https://github.com/CLOUDWERX-DEV/DiffuGen)

**Installation:**
```bash
git clone https://github.com/CLOUDWERX-DEV/diffugen.git
cd DiffuGen
chmod +x diffugen.sh setup_diffugen.sh
./setup_diffugen.sh
# Script installs: stable-diffusion.cpp, Python env, downloads models
```

**Supported Models:**
- Flux Schnell, Flux Dev
- SDXL, SD3, SD1.5

**Hardware Requirements:**
- Minimum: 4GB VRAM (CPU fallback available)
- Recommended: 8-12GB VRAM for comfortable generation
- Optimal: 16GB VRAM for fast 1024x1024 with refiner

**Batch Processing:** YES - native batch support + scripting
**Pricing Model:** FREE (local execution)
**Quality Assessment:** A (Flux), A- (SDXL)

---

#### 4. Stable Diffusion WebUI MCP

**Repository:** [github.com/Ichigo3766/image-gen-mcp](https://github.com/Ichigo3766/image-gen-mcp)

**Installation:**
```bash
# Requires running Stable Diffusion WebUI with --api flag
git clone https://github.com/Ichigo3766/image-gen-mcp.git
cd image-gen-mcp
npm install && npm run build
```

**Configuration:**
```bash
SD_WEBUI_URL=http://127.0.0.1:7860
SD_OUTPUT_DIR=./generated-images
SD_RESIZE_MODE=0
```

**Features:**
- generate_image with 1-150 steps, 512-2048px dimensions
- Batch size up to 4 images
- Model switching, upscaling
- Sampler/scheduler selection

**Batch Processing:** YES - batch size up to 4 per call
**Pricing Model:** FREE (local WebUI)
**Quality Assessment:** A- (depends on model loaded)

---

#### 5. Replicate Flux MCP

**Repository:** [github.com/GongRzhe/Image-Generation-MCP-Server](https://github.com/GongRzhe/Image-Generation-MCP-Server)

**Installation:**
```bash
# Via Smithery
npx -y @smithery/cli install @GongRzhe/Image-Generation-MCP-Server --client claude

# Or NPX directly
npx @gongrzhe/image-gen-server
```

**Configuration (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "image-gen": {
      "command": "npx",
      "args": ["@gongrzhe/image-gen-server"],
      "env": {
        "REPLICATE_API_TOKEN": "r8_..."
      }
    }
  }
}
```

**Batch Processing:** YES - 1-4 images per call
**Pricing Model:** ~$0.003/image (Flux Schnell)
**Quality Assessment:** A- (fast, good quality)

---

#### 6. DALL-E Image Generator MCP

**Repository:** [github.com/sammyl720/image-generator-mcp-server](https://github.com/sammyl720/image-generator-mcp-server)

**Installation:**
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "image-generator": {
      "command": "image-generator",
      "env": {
        "OPENAI_API_KEY": "<your-openai-api-key>"
      }
    }
  }
}
```

**Features:** Simple text-to-image via DALL-E 3
**Batch Processing:** NO (single image per call)
**Pricing Model:** $0.04-$0.12/image
**Quality Assessment:** B+ (good but expensive)

---

### Recommended MCP Setup for GymRats

**For Testing (API-based):**
```json
{
  "mcpServers": {
    "stability-ai": {
      "command": "npx",
      "args": ["-y", "mcp-server-stability-ai"],
      "env": {
        "STABILITY_AI_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

**For Bulk Generation (Local):**
```json
{
  "mcpServers": {
    "diffugen": {
      "command": "python",
      "args": ["-m", "diffugen.server"],
      "cwd": "/path/to/DiffuGen"
    }
  }
}
```

---

## API Comparison

### Pricing Table (2025-2026)

| Service | Per Image (1024px) | 1590 Images | Batch Discount | Quality | Best For |
|---------|-------------------|-------------|----------------|---------|----------|
| **Local (DiffuGen/ComfyUI)** | $0 | $0 | N/A | A | Bulk generation |
| **Replicate Flux Schnell** | $0.003 | ~$5 | No | A- | Fast prototyping |
| **fal.ai Flux 2 Pro** | $0.03/MP | ~$50 | No | A | Production quality |
| **Stability AI Core** | $0.03 | ~$48 | Possible | A | API integration |
| **Stability AI Ultra** | $0.08 | ~$127 | Possible | A+ | Highest quality |
| **GPT-image-1 Low** | $0.01 | ~$16 | No | B | Budget OpenAI |
| **GPT-image-1 Medium** | $0.04 | ~$64 | No | A- | Balanced OpenAI |
| **GPT-image-1 High** | $0.17 | ~$270 | No | A | Quality OpenAI |
| **DALL-E 3 Standard** | $0.04 | ~$64 | No | B+ | Legacy OpenAI |
| **DALL-E 3 HD** | $0.08-$0.12 | ~$127-$191 | No | A- | Higher res |
| **Ideogram 2a** | $0.04 | ~$64 | Pro plan | A | Text in images |
| **Ideogram 2a Turbo** | $0.025 | ~$40 | Pro plan | A- | Fast Ideogram |
| **Leonardo.ai** | Token-based | Varies | Plan-based | A- | Consistency tools |
| **Recraft AI** | Credit-based | Varies | Plan-based | A | Vector/SVG |

### Quality Assessment Legend
- **A+**: Exceptional, near-photorealistic or perfect style matching
- **A**: Excellent, consistent high quality
- **A-**: Very good, occasional inconsistencies
- **B+**: Good, suitable for production with review
- **B**: Acceptable, may need multiple attempts

### Hidden Costs to Consider

| Cost Type | DALL-E | Stability | Replicate | Local |
|-----------|--------|-----------|-----------|-------|
| API setup | Free | Free | Free | N/A |
| Failed retries | ~10% | ~5% | ~8% | ~15% |
| Storage | N/A | N/A | N/A | ~5GB |
| GPU electricity | N/A | N/A | N/A | ~$5/day |
| Rate limit delays | High | Medium | Low | None |

---

## Batch Processing Strategy

### Recommended Pipeline for 1590 Exercise Icons

#### Option A: Local Generation (Recommended for Budget)

**Hardware Requirements:**
- NVIDIA GPU with 8GB+ VRAM (12GB+ recommended)
- 32GB RAM
- 50GB free SSD space

**Pipeline:**
```
exercise-image-prompts.csv
         │
         ▼
   ComfyUI / DiffuGen
   (with CSV batch node)
         │
         ▼
   Raw 256x256 PNGs
         │
         ▼
   Quality Review Script
         │
         ▼
   Regenerate Failed
         │
         ▼
   Export to assets/exercise-icons/
```

**Time Estimate:**
- Setup: 2-4 hours
- Generation: 24-48 hours (unattended)
- Review: 4-8 hours
- Total: 2-3 days

**Tools:**
1. [ComfyUI-CSV-to-Prompt](https://github.com/TharindaMarasingha/ComfyUI-CSV-to-Prompt)
2. [ComfyUI-batching-nodes](https://github.com/Hahihula/ComfyUI-batching-nodes)
3. Auto-queue for continuous generation

---

#### Option B: Cloud API Generation (Recommended for Speed)

**Pipeline:**
```
exercise-image-prompts.csv
         │
         ▼
   Python Batch Script
   (using asyncio + rate limiting)
         │
         ▼
   API Queue (fal.ai/Replicate/Stability)
         │
         ▼
   Download Manager
         │
         ▼
   assets/exercise-icons/
```

**Python Script Template:**
```python
import asyncio
import csv
import aiohttp
import os
from pathlib import Path

async def generate_batch(prompts, api_key, output_dir):
    """Generate images from prompts using fal.ai"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for exercise_id, prompt in prompts:
            task = generate_single(session, api_key, exercise_id, prompt, output_dir)
            tasks.append(task)
            # Rate limiting: 5 concurrent requests
            if len(tasks) >= 5:
                await asyncio.gather(*tasks)
                tasks = []
                await asyncio.sleep(1)  # Cooldown
        if tasks:
            await asyncio.gather(*tasks)

def load_prompts(csv_path):
    """Load prompts from CSV file"""
    prompts = []
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            prompts.append((row['exercise_id'], row['image_prompt']))
    return prompts

# Run: asyncio.run(generate_batch(prompts, api_key, './output'))
```

**Time Estimate:**
- Setup: 30 minutes
- Generation: 2-4 hours (parallelized)
- Review: 4-8 hours
- Total: 1 day

---

#### Option C: Hybrid Approach (Recommended Overall)

1. **Test Phase (50 icons):** Use Stability AI MCP for quick validation
2. **Bulk Phase (1540 icons):** Local DiffuGen for zero-cost generation
3. **Regeneration:** API fallback for failed/poor quality icons

---

### CSV Integration with ComfyUI

**Using ComfyUI-CSV-to-Prompt:**

1. Install the custom node:
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/TharindaMarasingha/ComfyUI-CSV-to-Prompt.git
```

2. CSV Format (already compatible with exercise-image-prompts.csv):
```csv
exercise_id,exercise_name,equipment_in_image,body_position_description,image_prompt
wger_1470,"One Arm Lat Pulldown","yes","seated at cable machine...","minimalist exercise icon..."
```

3. Workflow Configuration:
- Set CSV Loader to point to `exercise-image-prompts.csv`
- Enable Auto Queue for continuous generation
- Configure batch saver with `{exercise_id}.png` naming

---

### Output Organization

```
assets/
└── exercise-icons/
    ├── raw/              # Original 256x256 generations
    ├── reviewed/         # QA-passed icons
    ├── rejected/         # Failed quality check (for regeneration)
    ├── 128/              # Scaled exports
    ├── 64/               # Scaled exports
    └── 48/               # Scaled exports
```

**Naming Convention:** `{exercise_id}.png`

---

### Error Handling and Retry Logic

```python
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

async def generate_with_retry(prompt_data):
    for attempt in range(MAX_RETRIES):
        try:
            result = await generate_image(prompt_data)
            if validate_output(result):
                return result
        except RateLimitError:
            await asyncio.sleep(RETRY_DELAY * (attempt + 1))
        except APIError as e:
            log_error(prompt_data['exercise_id'], e)
            if attempt == MAX_RETRIES - 1:
                save_to_failed_queue(prompt_data)
    return None
```

---

### Progress Tracking

```python
import json
from datetime import datetime

def save_progress(completed, failed, total):
    progress = {
        "timestamp": datetime.now().isoformat(),
        "completed": completed,
        "failed": failed,
        "total": total,
        "percentage": (completed / total) * 100
    }
    with open("generation_progress.json", "w") as f:
        json.dump(progress, f, indent=2)
```

---

## Cost Projections

### Exercise Icons (1590 images)

| Approach | Cost | Time | Notes |
|----------|------|------|-------|
| **Local (DiffuGen)** | $0 + electricity (~$5) | 24-48 hrs | Requires GPU |
| **Replicate Flux Schnell** | ~$5-8 | 2-3 hrs | Budget cloud option |
| **fal.ai Flux 2 Pro** | ~$50-65 | 3-4 hrs | Production quality |
| **Stability AI Core** | ~$48-60 | 4-6 hrs | Reliable API |
| **GPT-image-1 Low** | ~$16-20 | 6-8 hrs | Rate limited |

**Recommended:** Start with local DiffuGen, use fal.ai as fallback = **$0-$65**

---

### Full Asset Suite Estimate

| Asset Type | Count | Per-Image | Subtotal |
|------------|-------|-----------|----------|
| Exercise Icons | 1590 | $0-$0.03 | $0-$50 |
| UI Borders/Frames | 50 | $0.05 | $2.50 |
| Backgrounds | 20 | $0.08 | $1.60 |
| Avatar Base Poses | 100 | $0.05 | $5 |
| Avatar Accessories | 200 | $0.03 | $6 |
| Theme Visuals | 30 | $0.08 | $2.40 |
| **Total** | **1990** | - | **$17.50-$67.50** |

---

## Recommendations

### Phase 1: Exercise Icons

**Strategy:** Hybrid Local + API

1. **Week 1:** Setup and Test
   - Install DiffuGen locally
   - Generate 50 test icons
   - Validate quality against style guide
   - Adjust prompts if needed

2. **Week 2:** Bulk Generation
   - Run overnight batch through local DiffuGen
   - Use ComfyUI CSV batch node
   - Target: 200-300 icons per night

3. **Week 3:** Quality Control
   - Review generated icons
   - Regenerate failed ones via API (Stability AI)
   - Export to all required sizes

**Fallback:** If local quality insufficient, switch to fal.ai Flux (~$50 total)

---

### Phase 2: UI Elements

**Strategy:** Recraft AI for vectors

1. Use Recraft AI for SVG exports (borders, buttons)
2. Maintain consistent style with CSS-compatible output
3. Generate in batches by element type

---

### Phase 3: Avatar System

**Strategy:** Leonardo.ai or Stability AI

1. Create base poses with style locking
2. Generate accessories as transparent overlays
3. Use consistent seed ranges for coherent style

---

## Quick Start Guide

### Generate First 10 Test Icons

**Option 1: Using Stability AI MCP (5 minutes)**

1. Get API key from [platform.stability.ai](https://platform.stability.ai)

2. Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "stability-ai": {
      "command": "npx",
      "args": ["-y", "mcp-server-stability-ai"],
      "env": {
        "STABILITY_AI_API_KEY": "sk-YOUR-KEY"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. In Claude, run:
```
Generate an image with prompt: "minimalist exercise icon, single human silhouette in solid dark gray (#1A1A1A), person performing barbell bench press, lying on flat bench with back arched, arms extended upward holding barbell, lime green accent line showing upward pressing motion, transparent background, flat design, no gradients, fitness app icon style, ultra clean, sharp edges, centered composition"
```

---

**Option 2: Using DiffuGen Local (30 minutes setup)**

1. Clone and setup:
```bash
git clone https://github.com/CLOUDWERX-DEV/diffugen.git
cd DiffuGen
./setup_diffugen.sh
```

2. Start server:
```bash
python -m diffugen.server
```

3. Test via API or Claude MCP integration

---

**Option 3: Direct API Call (5 minutes)**

```python
import requests

response = requests.post(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    headers={
        "Authorization": "Bearer sk-YOUR-KEY",
        "Accept": "image/*"
    },
    files={"none": ''},
    data={
        "prompt": "minimalist exercise icon, single human silhouette...",
        "output_format": "png"
    }
)

with open("test_icon.png", "wb") as f:
    f.write(response.content)
```

---

## Additional Resources

### Documentation Links

- [Stability AI API Docs](https://platform.stability.ai/docs)
- [fal.ai Flux Documentation](https://fal.ai/flux)
- [Replicate Flux Models](https://replicate.com/collections/flux)
- [ComfyUI Batch Processing Guide](https://apatero.com/blog/batch-process-1000-images-comfyui-guide-2025)
- [DiffuGen GitHub](https://github.com/CLOUDWERX-DEV/DiffuGen)

### Related Project Files

- `docs/assets/exercise-image-prompts.csv` - 1590 prompts ready to use
- `docs/assets/EXERCISE-ICON-STYLE-GUIDE.md` - Visual style specification
- `docs/visual-style/ai-image-generation-tools.md` - Previous research (now superseded)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-06 | 1.0 | Initial comprehensive research |

---

*Generated for GymRats project. Prices current as of February 2026.*
