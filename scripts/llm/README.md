# LLM Backend Configuration for Claude Code

Instructions for switching Claude Code between Anthropic (direct) and OpenRouter (proxy to any model).

---

## How It Works

Claude Code has three model slots: **haiku** (cheap/fast), **sonnet** (default), and **opus** (heavy). When Claude Code picks a tier for a task, it routes to whatever model you've mapped to that slot.

With OpenRouter, you can map any slot to any model — Claude, GPT, Gemini, DeepSeek, Qwen, etc.

Configuration lives in `.claude/settings.local.json` under the `env` key. Each worktree/project can have its own settings, so you can run Opus in one worktree and Qwen in another.

---

## Quick Start

### Switch to OpenRouter
```bash
bash scripts/llm/switch-openrouter.sh
```

### Switch to DeepSeek V3 (all slots)
```bash
bash scripts/llm/switch-deepseek.sh
```

### Switch to Devstral 2 (all slots)
```bash
bash scripts/llm/switch-devstral.sh
```

### Switch back to direct Anthropic
```bash
bash scripts/llm/switch-claude.sh
```

### Check current status
```bash
bash scripts/llm/status.sh
```

### Save your OpenRouter API key (one-time)
```bash
bash scripts/llm/save-openrouter-key.sh sk-or-v1-your-key-here
```

**After switching, restart Claude Code to apply changes.**

---

## Model Slot Mapping

The current OpenRouter template (`openrouter-template.json`) maps:

| Slot | Model | Use Case |
|------|-------|----------|
| Haiku | `mistralai/devstral-2512` | Cheap/fast tasks |
| Sonnet | `google/gemini-2.5-pro` | Default tasks |
| Opus | `anthropic/claude-opus-4` | Heavy tasks |

### Changing a Model

Edit `openrouter-template.json` to change the default mapping:

```json
{
  "ANTHROPIC_AUTH_TOKEN": "__OPENROUTER_API_KEY__",
  "ANTHROPIC_API_KEY": "",
  "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mistralai/devstral-2512",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen/qwen3-coder-480b-a35b",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4"
}
```

Then re-run `switch-openrouter.sh` and restart Claude Code.

### Per-Worktree Configuration

Each worktree has its own `.claude/settings.local.json`. To run different models in different worktrees:

1. Navigate to the worktree
2. Edit `.claude/settings.local.json` directly, or
3. Run the switch script from within that worktree

Example: Run Qwen3-Coder in `forgerank-glm` while keeping Opus in `Forgerank`:
- `Forgerank/.claude/settings.local.json` → direct Anthropic (Opus)
- `forgerank-glm/.claude/settings.local.json` → OpenRouter (Qwen3-Coder in sonnet slot)

---

## Checking Which Model Is Active

### In Claude Code
```
/status
```
Shows which model is mapped to each slot.

### From terminal
```bash
bash scripts/llm/status.sh
```

### Manual check
```bash
cat .claude/settings.local.json
```
Look at the `env` section for `ANTHROPIC_DEFAULT_*_MODEL` values.

---

## Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_AUTH_TOKEN` | API key sent as Authorization header |
| `ANTHROPIC_API_KEY` | Set to empty string when using OpenRouter |
| `ANTHROPIC_BASE_URL` | Gateway URL (e.g., `https://openrouter.ai/api`) |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Model ID for the haiku (cheap) slot |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Model ID for the sonnet (default) slot |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Model ID for the opus (heavy) slot |

When using direct Anthropic, none of these are set (Claude Code uses its defaults).

---

## Recommended Model Configurations

### Budget Coding (all cheap)
```json
"ANTHROPIC_DEFAULT_HAIKU_MODEL": "mistralai/devstral-2512",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "mistralai/devstral-2512",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "mistralai/devstral-2512"
```

### DeepSeek All-In
```bash
bash scripts/llm/switch-deepseek.sh
```
Maps all three slots to DeepSeek V3 via OpenRouter. Ultra cheap ($0.24/$0.38 per 1M tokens).

### Devstral All-In
```bash
bash scripts/llm/switch-devstral.sh
```
Maps all three slots to Devstral 2 via OpenRouter.

### Qwen3-Coder Focus
```json
"ANTHROPIC_DEFAULT_HAIKU_MODEL": "mistralai/devstral-2512",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen/qwen3-coder-480b-a35b",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "qwen/qwen3-coder-480b-a35b"
```

### Mixed (Best Value)
```json
"ANTHROPIC_DEFAULT_HAIKU_MODEL": "mistralai/devstral-2512",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen/qwen3-coder-480b-a35b",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4"
```

### Direct Anthropic (No OpenRouter)
Run `switch-claude.sh` — removes all env vars, Claude Code uses native Anthropic API.

---

## API Pricing Reference

All prices per **1 million tokens** via OpenRouter (Jan 2026). OpenRouter passes through provider pricing with no markup (5.5% fee on credit purchases).

### Claude (Direct Anthropic)

| Model | Input | Output | Context | Notes |
|-------|-------|--------|---------|-------|
| **Haiku 4.5** | $1.00 | $5.00 | 200K | Cheap/fast, good for subagents |
| **Sonnet 4.5** | $3.00 | $15.00 | 200K (1M available) | Default workhorse |
| **Opus 4.5** | $5.00 | $25.00 | 200K | Frontier reasoning |
| **Sonnet 4** | $3.00 | $15.00 | 200K | Previous gen, still strong |
| **Opus 4** | $15.00 | $75.00 | 200K | Legacy, 3x pricier than 4.5 |

### OpenRouter Models (Non-Claude)

| Model | OpenRouter ID | Input | Output | Context | Category |
|-------|---------------|-------|--------|---------|----------|
| **DeepSeek V3.2** | `deepseek/deepseek-r1-0528` | $0.24 | $0.38 | 128K | Budget |
| **Devstral 2** | `mistralai/devstral-2512` | $0.15 | $0.60 | 256K | Budget |
| **Qwen3-Coder 480B** | `qwen/qwen3-coder` | $0.22 | $0.95 | 262K | Budget |
| **MiniMax M2.1** | `minimax/minimax-m2.1` | $0.30 | $1.20 | 205K | Budget |
| **GLM-4.7** | `z-ai/glm-4.7` | $0.40 | $1.50 | 202K | Mid-range |
| **Kimi K2** | `moonshotai/kimi-k2` | $0.60 | $2.50 | 131K | Mid-range |
| **Qwen3-Coder Plus** | `qwen/qwen3-coder-plus` | $1.00 | $5.00 | 128K | Mid-range |
| **GPT-5** | `openai/gpt-5` | $1.25 | $10.00 | 400K | Premium |
| **Gemini 2.5 Pro** | `google/gemini-2.5-pro` | $1.25 | $10.00 | 1M | Premium |
| **GPT-5.2-Codex** | `openai/gpt-5.2-codex` | $1.75 | $14.00 | 400K | Premium |

### Cost Comparison (Typical Session)

A complex coding task (~50K input, ~15K output per call, ~10 calls):

| Model | Est. Session Cost | vs. Opus 4.5 |
|-------|-------------------|---------------|
| DeepSeek V3.2 | ~$0.18 | **98% cheaper** |
| Devstral 2 | ~$0.17 | **98% cheaper** |
| Qwen3-Coder 480B | ~$0.25 | **97% cheaper** |
| MiniMax M2.1 | ~$0.33 | **96% cheaper** |
| GLM-4.7 | ~$0.43 | **95% cheaper** |
| Kimi K2 | ~$0.68 | **92% cheaper** |
| Sonnet 4.5 | ~$3.75 | **56% cheaper** |
| GPT-5 | ~$2.13 | **75% cheaper** |
| Gemini 2.5 Pro | ~$2.13 | **75% cheaper** |
| **Opus 4.5** | **~$6.25** | **baseline** |

---

## Anthropic-Compatible Models for Claude Code

Claude Code uses the **Anthropic Messages API** with native tool calling. OpenRouter's "Anthropic Skin" (`https://openrouter.ai/api`) translates this protocol so non-Claude models can receive Anthropic-formatted requests. However, not all models handle tool calling equally well.

**Exacto variants** (append `:exacto` to model ID) are OpenRouter-curated endpoints that route to providers with the highest tool-calling accuracy. Use these when available.

### Tier 1: Best for Claude Code (Strong Tool Calling + Agentic Coding)

#### 1. Qwen3-Coder 480B — Best Budget Replacement
| | |
|---|---|
| **ID** | `qwen/qwen3-coder` or `qwen/qwen3-coder:exacto` |
| **Price** | $0.22 / $0.95 (Input/Output per 1M) |
| **Context** | 262K |
| **SWE-bench** | Matches Sonnet 4.5 at ~3.5% the cost |

**Strengths:** Purpose-built for agentic coding. MoE architecture (480B total, 35B active) gives strong reasoning at low cost. Excellent tool use, function calling, and long-context repo analysis. Free tier available.

**Weaknesses:** Can be verbose. Occasionally hallucinates file paths. Not as reliable as Claude for nuanced refactoring or complex multi-step plans. Some providers have higher latency.

**vs. Claude:** Comparable to Sonnet for straightforward coding tasks. Falls short of Opus for complex architectural decisions. ~14x cheaper than Sonnet.

---

#### 2. Devstral 2 — Best Open-Source Agentic Coder
| | |
|---|---|
| **ID** | `mistralai/devstral-2512` |
| **Price** | $0.15 / $0.60 |
| **Context** | 256K |
| **Architecture** | 123B dense transformer |

**Strengths:** Mistral's flagship coding model. Strong agentic performance — designed for tool use, file editing, and multi-step execution. Open source (modified MIT). Very cheap. Good at following structured instructions.

**Weaknesses:** Dense model means higher latency per token than MoE alternatives. Less creative than Claude for open-ended tasks. Can struggle with very large codebases. Newer model, less battle-tested.

**vs. Claude:** Competitive with Sonnet for code generation. Weaker at natural language reasoning and creative problem-solving. ~20x cheaper than Sonnet.

---

#### 3. GLM-4.7 — Best Chinese-Origin Agentic Model
| | |
|---|---|
| **ID** | `z-ai/glm-4.7` |
| **Price** | $0.40 / $1.50 |
| **Context** | 202K |
| **SWE-bench** | 73.8% |

**Strengths:** Excellent multi-step reasoning and execution. Strong agent task performance. MIT licensed. Stable tool calling. Enhanced programming capabilities over GLM-4.6. Good front-end code aesthetics.

**Weaknesses:** Smaller community and ecosystem than Claude/GPT. Documentation primarily in Chinese. Can be overly cautious (refuses edge cases). Flash variant (30B) available at $0.07/$0.40 for simple tasks.

**vs. Claude:** SWE-bench competitive with Sonnet. ~7x cheaper. Weaker at English-language nuance and complex refactoring explanations.

---

#### 4. GPT-5.2-Codex — OpenAI's Best for Code
| | |
|---|---|
| **ID** | `openai/gpt-5.2-codex` |
| **Price** | $1.75 / $14.00 |
| **Context** | 400K |

**Strengths:** OpenAI's top agentic coding model. Excellent instruction following, code reviews, and multi-step execution. Supports multimodal inputs (screenshots for UI work). Adjustable reasoning effort. 400K context is the largest among premium models.

**Weaknesses:** Expensive — close to Sonnet pricing. Uses OpenAI-style tool call IDs which occasionally cause formatting quirks through OpenRouter's Anthropic skin. Not as good at "surgical edits" as Claude — tends toward larger rewrites.

**vs. Claude:** On par with Sonnet/Opus for code generation quality. Different "personality" — more verbose, more likely to add comments and docstrings unprompted. Similar price to Sonnet, cheaper than Opus.

---

#### 5. MiniMax M2.1 — Best Lightweight Agentic Model
| | |
|---|---|
| **ID** | `minimax/minimax-m2.1` |
| **Price** | $0.30 / $1.20 |
| **Context** | 205K |
| **Architecture** | 10B activated parameters |

**Strengths:** Remarkably capable for its size. 72.5% SWE-bench Multilingual. Strong coding and agentic workflow performance. Extremely fast inference. Low cost. Exacto variant available for better tool calling.

**Weaknesses:** Only 10B active params — struggles with highly complex architectural reasoning. Can miss subtle bugs. Less reliable on very long multi-step tasks. Weaker at natural language explanations.

**vs. Claude:** Best mapped to the Haiku slot. Comparable to Haiku for simple tasks at ~3x cheaper. Not a replacement for Sonnet/Opus on complex work.

---

### Tier 2: Good for Claude Code (Capable but With Caveats)

#### 6. Kimi K2 — Budget Reasoning Powerhouse
| | |
|---|---|
| **ID** | `moonshotai/kimi-k2` |
| **Price** | $0.60 / $2.50 |
| **Context** | 131K |
| **Architecture** | 1T total, 32B active (MoE) |

**Strengths:** Strong reasoning, improved tool calling and file handling. Explicitly marketed as "Claude Code compatible." Good at debugging and analysis. Thinking variant available for harder problems.

**Weaknesses:** 131K context is the smallest on this list. Newer model with less community feedback. Some reports of inconsistent tool call formatting.

**vs. Claude:** Competitive with Sonnet on reasoning tasks. ~5x cheaper. Smaller context limits usefulness for large codebases.

---

#### 7. GPT-5 — General Purpose Premium
| | |
|---|---|
| **ID** | `openai/gpt-5` |
| **Price** | $1.25 / $10.00 |
| **Context** | 400K |

**Strengths:** OpenAI's flagship general model. Excellent at reasoning, instruction following, and multi-turn conversations. 400K context. Strong tool calling. Well-tested and stable.

**Weaknesses:** Not code-specialized like Codex variant. More expensive than most budget alternatives. Can be verbose. Tends to "explain" when you just want code.

**vs. Claude:** Similar capability to Sonnet for general tasks. Slightly cheaper ($1.25 vs $3.00 input). Codex variant is better for pure coding.

---

#### 8. DeepSeek V3.2 — Ultra-Budget All-Rounder
| | |
|---|---|
| **ID** | `deepseek/deepseek-r1-0528` |
| **Price** | $0.24 / $0.38 |
| **Context** | 128K |

**Strengths:** Absurdly cheap. Good at general coding tasks. Cache hits drop to $0.07/M input. Strong reasoning for the price. Works well for simple file edits and code generation.

**Weaknesses:** Tool calling can be unreliable — better for text generation than agentic workflows. Struggles with complex multi-step tool use. Can produce inconsistent JSON formatting. Best for the Haiku slot, not Sonnet/Opus.

**vs. Claude:** Good Haiku replacement for simple tasks. Not competitive with Sonnet for agentic work. ~12x cheaper than Haiku.

---

#### 9. Gemini 2.5 Pro — Long Context Specialist
| | |
|---|---|
| **ID** | `google/gemini-2.5-pro` |
| **Price** | $1.25 / $10.00 |
| **Context** | 1M |

**Strengths:** 1M token context — by far the largest. Strong benchmarks. Good at analysis and reasoning. Vision support for UI tasks.

**Weaknesses:** **Clunky in Claude Code.** Tends to overwrite entire files rather than making surgical edits. Tool calling format differences cause issues. Not designed for Anthropic's agentic workflow. Often ignores edit boundaries. Slower response times.

**vs. Claude:** Strong on benchmarks but poor fit for Claude Code specifically. Use only when you need massive context (e.g., analyzing an entire codebase at once). Similar price to GPT-5, worse agentic behavior.

---

#### 10. Qwen3-Coder Plus — Proprietary Qwen Upgrade
| | |
|---|---|
| **ID** | `qwen/qwen3-coder-plus` |
| **Price** | $1.00 / $5.00 |
| **Context** | 128K |

**Strengths:** Alibaba's proprietary upgrade over the open-source Qwen3-Coder. Better instruction following and code quality. More reliable tool calling than the base model.

**Weaknesses:** Smaller context (128K vs 262K for base). Costs ~5x more than the open-source version. Not open source. Less community visibility into behavior.

**vs. Claude:** Positioned between Haiku and Sonnet in capability. Similar price to Haiku 4.5. Good mid-tier option.

---

### Quick Comparison Matrix

| Model | Tool Use | Code Quality | Reasoning | Agentic | Price Tier |
|-------|----------|-------------|-----------|---------|------------|
| **Claude Opus 4.5** | Excellent | Excellent | Excellent | Excellent | $$$$$ |
| **Claude Sonnet 4.5** | Excellent | Excellent | Very Good | Excellent | $$$ |
| **Claude Haiku 4.5** | Good | Good | Good | Good | $$ |
| GPT-5.2-Codex | Very Good | Very Good | Very Good | Very Good | $$$ |
| GPT-5 | Very Good | Good | Very Good | Good | $$$ |
| Qwen3-Coder 480B | Good | Very Good | Good | Good | $ |
| Devstral 2 | Good | Very Good | Good | Good | $ |
| GLM-4.7 | Good | Good | Very Good | Good | $ |
| Kimi K2 | Good | Good | Very Good | Fair | $ |
| MiniMax M2.1 | Good | Good | Fair | Good | $ |
| Qwen3-Coder Plus | Good | Good | Good | Good | $$ |
| DeepSeek V3.2 | Fair | Good | Good | Fair | $ |
| Gemini 2.5 Pro | Fair* | Good | Very Good | Poor* | $$$ |

*Gemini's tool use and agentic ratings are specifically for Claude Code — it works better in native Gemini/Vertex tooling.

### Recommended Slot Assignments

**Best overall (Anthropic direct):**
```json
Haiku → Claude Haiku 4.5
Sonnet → Claude Sonnet 4.5
Opus → Claude Opus 4.5
```

**Best value via OpenRouter:**
```json
Haiku → deepseek/deepseek-r1-0528 ($0.24/$0.38)
Sonnet → qwen/qwen3-coder:exacto ($0.22/$0.95)
Opus → anthropic/claude-opus-4 ($5/$25) or openai/gpt-5.2-codex ($1.75/$14)
```

**Ultra budget:**
```json
Haiku → minimax/minimax-m2.1 ($0.30/$1.20)
Sonnet → qwen/qwen3-coder:exacto ($0.22/$0.95)
Opus → z-ai/glm-4.7 ($0.40/$1.50)
```

**Maximum capability (no Claude):**
```json
Haiku → minimax/minimax-m2.1 ($0.30/$1.20)
Sonnet → openai/gpt-5.2-codex ($1.75/$14)
Opus → openai/gpt-5.2-codex ($1.75/$14)
```

---

## Finding Model IDs

Browse available models at [openrouter.ai/models](https://openrouter.ai/models). The model ID is the slug shown on each model's page (e.g., `qwen/qwen3-coder-480b-a35b`, `anthropic/claude-opus-4`, `deepseek/deepseek-r1-0528`).

For Exacto variants (better tool calling), append `:exacto` to the model ID (e.g., `qwen/qwen3-coder:exacto`).

---

## Troubleshooting

**"Model not found" errors:** Double-check the model ID slug on OpenRouter. IDs are case-sensitive and include the org prefix.

**Clunky behavior with non-Claude models:** Some models struggle with Claude Code's agentic tool-calling workflow. Claude (Opus/Sonnet) and models designed for agentic coding (Qwen3-Coder, Devstral, DeepSeek) work best. Gemini tends to overwrite files rather than edit surgically.

**Tool calling failures:** Try the `:exacto` variant of your model (e.g., `qwen/qwen3-coder:exacto`). Exacto routes to providers with the highest measured tool-calling accuracy.

**API key issues:** Run `bash scripts/llm/save-openrouter-key.sh` to re-save your key. Key is stored at `~/.config/forgerank/.env.openrouter`.

**Changes not taking effect:** Restart Claude Code after any configuration change.

---

*Pricing last verified: January 2026. Check [openrouter.ai/pricing](https://openrouter.ai/pricing) for current rates.*
