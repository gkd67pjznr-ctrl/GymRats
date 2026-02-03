# Execution Plan: Standalone API Backend Switching (Anthropic <-> GLM / OpenRouter)

## What This Document Is

A step-by-step plan to extract the API backend switching capability from the ADK reference code in `APIswitch/` and reimplement it as standalone tooling that works in this project with **zero ADK dependencies**. Covers two switchable backends: **GLM** (direct) and **OpenRouter** (universal adapter that also enables DeepSeek, Gemini, and others).

---

## 1. How The Switch Actually Works (The Core Insight)

Claude Code reads environment variable overrides from `.claude/settings.local.json`. The entire backend switch is accomplished by writing environment variables into that file's `env` block.

**GLM switch (5 env vars):**
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "<your-glm-api-key>",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

GLM exposes an **Anthropic-compatible proxy** at `https://api.z.ai/api/anthropic`. Claude Code thinks it's talking to Anthropic.

**OpenRouter switch (6 env vars):**
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "<your-openrouter-api-key>",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek/deepseek-r1-0528-v3-0324",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic/claude-sonnet-4",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4"
  }
}
```

OpenRouter exposes an **Anthropic-compatible endpoint** they call the "Anthropic Skin" at `https://openrouter.ai/api`. The 6th var `ANTHROPIC_API_KEY=""` is **critical** -- without it, Claude Code ignores the base URL override and falls back to Anthropic's servers.

**Switching back to Anthropic** = removing those env vars. Claude Code reverts to its native connection.

That's it. Everything else is scaffolding.

---

## 2. Current State

The project's `.claude/settings.local.json` currently contains:

```json
{
  "enabledMcpjsonServers": [
    "context7",
    "sequential-thinking",
    "stitch"
  ]
}
```

Any switching implementation **must preserve existing keys** (like `enabledMcpjsonServers`) and only add/remove the backend env vars.

---

## 3. What We Need (Minimal Components)

| # | Component | Purpose | Implementation |
|---|-----------|---------|----------------|
| 1 | **GLM config template** | Defines the 5 GLM env vars with a key placeholder | JSON file |
| 2 | **OpenRouter config template** | Defines the 6 OpenRouter env vars with a key placeholder | JSON file |
| 3 | **Key storage** | Securely stores API keys on disk per provider | `.env.<provider>` dotenv files at `~/.config/gymrats/` (chmod 600) |
| 4 | **Switch-to-GLM script** | Reads template, substitutes key, merges into `settings.local.json` | Shell script |
| 5 | **Switch-to-OpenRouter script** | Same pattern, 6 vars instead of 5 | Shell script |
| 6 | **Switch-to-Claude script** | Removes all backend env vars from `settings.local.json` | Shell script |
| 7 | **Save-key scripts** | Save an API key to the secure storage file per provider | Shell scripts |
| 8 | **Status check** | Reports which backend is currently active | Shell script |

**NOT needed** (ADK-specific, irrelevant to us):
- Model allocator (we don't have multiple agent types)
- Worktree integration (not using git worktrees for LLM switching)
- Interactive init wizard (overkill)
- YAML config files for modes/pricing (unnecessary abstraction)
- Python CLI framework (click, rich) -- shell scripts are simpler and have zero deps
- `credentials.yaml` legacy format -- single dotenv files are sufficient
- LiteLLM proxy -- OpenRouter natively supports Anthropic protocol, no translation needed

---

## 4. File Structure To Create

```
scripts/
  llm/
    glm-template.json           # GLM: 5 env vars
    openrouter-template.json    # OpenRouter: 6 env vars
    save-glm-key.sh             # Save GLM API key securely
    save-openrouter-key.sh      # Save OpenRouter API key securely
    switch-glm.sh               # Switch backend to GLM
    switch-openrouter.sh        # Switch backend to OpenRouter
    switch-claude.sh            # Revert to native Anthropic (works for any backend)
    status.sh                   # Show current backend status
```

Credential storage:
- `~/.config/gymrats/.env.glm` (GLM key)
- `~/.config/gymrats/.env.openrouter` (OpenRouter key)

---

## 5. Detailed Implementation Per File

### 5.1 `scripts/llm/glm-template.json`

5 env vars with `__GLM_API_KEY__` as the substitution placeholder.

```json
{
  "ANTHROPIC_AUTH_TOKEN": "__GLM_API_KEY__",
  "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
}
```

### 5.2 `scripts/llm/openrouter-template.json`

6 env vars with `__OPENROUTER_API_KEY__` as the substitution placeholder.

```json
{
  "ANTHROPIC_AUTH_TOKEN": "__OPENROUTER_API_KEY__",
  "ANTHROPIC_API_KEY": "",
  "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek/deepseek-r1-0528",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "google/gemini-2.5-pro",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4"
}
```

**Recommended default configuration:**
- **Haiku** → `deepseek/deepseek-r1-0528` -- cheap, fast, handles exploration and simple tasks
- **Sonnet** → `google/gemini-2.5-pro` -- strong coding, 1M context window, best non-Claude tool use
- **Opus** → `anthropic/claude-opus-4` -- top-tier reasoning, stays Claude through OpenRouter

This gives three different providers in one backend, optimized by tier. OpenRouter handles all protocol translation and you get one bill.

The model names are customizable. Some alternative presets:

| Tier | Cost-optimized | Quality-optimized | Balanced (recommended) |
|------|---------------|-------------------|------------------------|
| Haiku | `deepseek/deepseek-r1-0528` | `anthropic/claude-3.5-haiku` | `deepseek/deepseek-r1-0528` |
| Sonnet | `deepseek/deepseek-r1-0528` | `anthropic/claude-sonnet-4` | `google/gemini-2.5-pro` |
| Opus | `google/gemini-2.5-pro` | `anthropic/claude-opus-4` | `anthropic/claude-opus-4` |

**Common pitfalls to avoid:**
- Do NOT use `https://openrouter.ai/api/v1` as the base URL (that's the OpenAI endpoint, causes double `/v1` path)
- Do NOT omit `ANTHROPIC_API_KEY: ""` (Claude Code silently falls back to Anthropic servers)
- Do NOT use `:free` suffix models (aggressive rate limits, unreliable for sustained Claude Code sessions)

### 5.3 `scripts/llm/save-glm-key.sh` and `save-openrouter-key.sh`

Both follow the same pattern:

1. Takes an API key as argument
2. Creates `~/.config/gymrats/` directory if it doesn't exist
3. Writes the key to the provider's dotenv file
4. Sets file permissions to 600 (owner read/write only)
5. Confirms success

**GLM dotenv format:** `GLM_API_KEY="<key>"`
**OpenRouter dotenv format:** `OPENROUTER_API_KEY="<key>"`

**Usage:**
```bash
./scripts/llm/save-glm-key.sh sk-glm-your-key-here
./scripts/llm/save-openrouter-key.sh sk-or-v1-your-key-here
```

### 5.4 `scripts/llm/switch-glm.sh` and `switch-openrouter.sh`

Both follow the same pattern:

1. Checks that the provider's key file exists and contains a key
2. Reads the API key from the dotenv file
3. Checks if `.claude/settings.local.json` already has this provider's `ANTHROPIC_BASE_URL` -- if so, exits early
4. If a *different* backend is currently active, cleans its keys first
5. Reads the template and substitutes the key placeholder with the actual key
6. Reads existing `.claude/settings.local.json` (or starts with `{}` if missing)
7. Merges the env vars into the `env` block, preserving all other keys
8. Writes back to `.claude/settings.local.json` with pretty formatting
9. Prints confirmation and reminds user to restart Claude Code

**Critical implementation details (from ADK `_switch_to_glm()`):**
- Must preserve existing keys in `settings.local.json` (e.g., `enabledMcpjsonServers`)
- Must preserve existing non-backend env vars if `env` block already exists
- If `env` block doesn't exist, create it
- JSON merge, not overwrite

**Implementation choice: Use Node.js** (since this is a Node.js project and `jq` may not be installed). The script will be a shell wrapper that calls a tiny inline Node.js snippet for the JSON merge.

**Usage:**
```bash
./scripts/llm/switch-glm.sh
./scripts/llm/switch-openrouter.sh
```

### 5.5 `scripts/llm/switch-claude.sh`

Universal revert script. Works regardless of which backend is active.

1. Reads `.claude/settings.local.json`
2. Checks if `ANTHROPIC_BASE_URL` exists in the `env` block -- if not, already on Claude, exits early
3. Removes these keys from `env`:
   - `ANTHROPIC_AUTH_TOKEN`
   - `ANTHROPIC_API_KEY` (only if value is `""` -- if it has a real key, leave it)
   - `ANTHROPIC_BASE_URL`
   - `ANTHROPIC_DEFAULT_HAIKU_MODEL`
   - `ANTHROPIC_DEFAULT_SONNET_MODEL`
   - `ANTHROPIC_DEFAULT_OPUS_MODEL`
4. If `env` block is now empty, removes the `env` key entirely
5. Writes back to `.claude/settings.local.json`
6. Prints confirmation

**Usage:**
```bash
./scripts/llm/switch-claude.sh
```

### 5.6 `scripts/llm/status.sh`

Detects which backend is active:

```
if ANTHROPIC_BASE_URL contains "openrouter.ai" → "Backend: OpenRouter"
if ANTHROPIC_BASE_URL contains "api.z.ai"       → "Backend: GLM"
if ANTHROPIC_BASE_URL is absent                  → "Backend: Anthropic (native)"
else                                             → "Backend: Custom ({url})"
```

Also reports which provider keys are saved in `~/.config/gymrats/`.

**Usage:**
```bash
./scripts/llm/status.sh
```

---

## 6. Step-By-Step Execution Order

### Step 1: Create directory structure
```
mkdir -p scripts/llm
```

### Step 2: Create templates
Write `glm-template.json` (5 keys) and `openrouter-template.json` (6 keys).

### Step 3: Create save-key scripts
`save-glm-key.sh` and `save-openrouter-key.sh`. Pure bash, no dependencies.

### Step 4: Create switch scripts
`switch-glm.sh`, `switch-openrouter.sh`, and `switch-claude.sh`. Each uses an inline Node.js snippet for JSON manipulation:

```javascript
// Read existing settings (or empty object)
// Read template, substitute key placeholder
// Merge: settings.env = { ...settings.env, ...templateEnv }
// Write back with JSON.stringify(settings, null, 2)
```

### Step 5: Create status script
`status.sh` using Node.js (or `grep`) to check `ANTHROPIC_BASE_URL`.

### Step 6: Make all scripts executable
```
chmod +x scripts/llm/*.sh
```

### Step 7: Test the full cycle (GLM)
1. `./scripts/llm/save-glm-key.sh <test-key>`
2. `./scripts/llm/status.sh` -- should show "Anthropic (native)"
3. `./scripts/llm/switch-glm.sh` -- should merge GLM env
4. Verify `.claude/settings.local.json` has both `enabledMcpjsonServers` AND the 5 GLM vars
5. `./scripts/llm/status.sh` -- should show "GLM"
6. `./scripts/llm/switch-claude.sh` -- should remove GLM env
7. Verify `.claude/settings.local.json` is back to original
8. `./scripts/llm/status.sh` -- should show "Anthropic (native)"

### Step 8: Test the full cycle (OpenRouter)
1. `./scripts/llm/save-openrouter-key.sh <test-key>`
2. `./scripts/llm/switch-openrouter.sh` -- should merge 6 OpenRouter env vars
3. Verify `ANTHROPIC_API_KEY` is `""` and `ANTHROPIC_BASE_URL` is `https://openrouter.ai/api`
4. `./scripts/llm/status.sh` -- should show "OpenRouter"
5. `./scripts/llm/switch-claude.sh` -- should remove all 6 vars
6. Verify `ANTHROPIC_API_KEY` was removed (since it was `""`)

### Step 9: Test cross-switching
1. Switch to GLM, then directly to OpenRouter (should clean GLM keys, apply OpenRouter keys)
2. Switch to OpenRouter, then directly to GLM (should clean OpenRouter keys, apply GLM keys)

---

## 7. Environment Variables Reference

### GLM (5 keys)

| Variable | Value | Purpose |
|----------|-------|---------|
| `ANTHROPIC_AUTH_TOKEN` | `<glm-api-key>` | Auth token for GLM proxy |
| `ANTHROPIC_BASE_URL` | `https://api.z.ai/api/anthropic` | Redirects API calls to GLM |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `glm-4.7` | Overrides haiku model |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `glm-4.7` | Overrides sonnet model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `glm-4.7` | Overrides opus model |

### OpenRouter (6 keys)

| Variable | Value | Purpose |
|----------|-------|---------|
| `ANTHROPIC_AUTH_TOKEN` | `<openrouter-api-key>` | Auth token for OpenRouter |
| `ANTHROPIC_API_KEY` | `""` (empty string) | **Prevents Claude Code from falling back to Anthropic servers** |
| `ANTHROPIC_BASE_URL` | `https://openrouter.ai/api` | Redirects API calls to OpenRouter |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `<provider/model>` | Overrides haiku model (customizable) |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `<provider/model>` | Overrides sonnet model (customizable) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `<provider/model>` | Overrides opus model (customizable) |

**Why `ANTHROPIC_API_KEY=""` is needed for OpenRouter but not GLM:** GLM's proxy accepts the key via `ANTHROPIC_AUTH_TOKEN` and Claude Code doesn't try to fall back. OpenRouter's endpoint requires explicitly disabling the default Anthropic auth path by setting `ANTHROPIC_API_KEY` to empty, forcing Claude Code to rely on `ANTHROPIC_AUTH_TOKEN` exclusively.

---

## 8. Error Handling Requirements

Extracted from ADK test suite (`test_switch.py`, 715 lines of tests):

| Scenario | Expected Behavior |
|----------|-------------------|
| No provider key saved | Abort with message: "API key not found. Run save-{provider}-key.sh first." |
| `settings.local.json` doesn't exist | Create it fresh with just the backend env block |
| `settings.local.json` has invalid JSON | Replace with fresh content (backend env block only) |
| Already on target backend (switch called twice) | Print "Already using {backend}." and exit cleanly |
| Already on Claude (switch-claude called twice) | Print "Already using Claude backend." and exit cleanly |
| Template JSON missing | Abort with message about missing template |
| Existing env vars in settings | Preserve them; only add/remove backend-specific keys |
| Empty env block after removing backend keys | Remove the `env` key entirely |
| Cross-switching (GLM -> OpenRouter directly) | Clean old backend keys, apply new ones |

---

## 9. What Was Stripped From The ADK

| ADK Component | Why It's Not Needed |
|---------------|---------------------|
| `moai_adk` Python package | We use shell scripts + inline Node.js instead |
| `click` CLI framework | Shell scripts don't need it |
| `rich` console formatting | Simple echo/printf is sufficient |
| `yaml` config parser | No YAML configs needed |
| `credentials.yaml` (multi-key storage) | Single dotenv file per provider is simpler |
| `model_allocator.py` (agent-to-model mapping) | We don't have multiple agent types to allocate |
| `llm.yaml` (mode config: mashup/glm-only) | We only need discrete backend states |
| `pricing.yaml` (service type/plan) | Not relevant to simple switching |
| Worktree integration | Not using worktrees for backend switching |
| Init wizard (interactive prompts) | `save-*-key.sh` scripts cover key setup |
| Shell config cleanup | We store keys in `~/.config/gymrats/`, not in shell exports |
| Windows console compatibility | macOS only for now |

---

## 10. Security Considerations

1. **Key file permissions**: All files in `~/.config/gymrats/` get `chmod 600` (owner read/write only)
2. **Never commit keys**: Key files are outside the repo. `settings.local.json` will contain actual key values after switching -- `.claude/settings.local.json` is already in `.gitignore`
3. **Masked display**: Status output shows only first 8 chars of any key (`sk-or-v1-...`)

---

## 11. Verification Checklist

After implementation, verify:

**GLM:**
- [ ] `save-glm-key.sh` creates `~/.config/gymrats/.env.glm` with correct format and 600 permissions
- [ ] `switch-glm.sh` adds exactly 5 env vars to `settings.local.json`
- [ ] `switch-glm.sh` preserves `enabledMcpjsonServers` and any other existing keys
- [ ] `switch-glm.sh` substitutes the actual key value (no `__GLM_API_KEY__` in output)

**OpenRouter:**
- [ ] `save-openrouter-key.sh` creates `~/.config/gymrats/.env.openrouter` with correct format and 600 permissions
- [ ] `switch-openrouter.sh` adds exactly 6 env vars to `settings.local.json`
- [ ] `switch-openrouter.sh` includes `ANTHROPIC_API_KEY: ""` in the output
- [ ] `switch-openrouter.sh` preserves all non-backend keys

**Revert:**
- [ ] `switch-claude.sh` removes all backend env vars, nothing else
- [ ] `switch-claude.sh` removes `ANTHROPIC_API_KEY` only when its value is `""`
- [ ] `switch-claude.sh` removes empty `env` block
- [ ] `switch-claude.sh` preserves all non-backend settings

**General:**
- [ ] `status.sh` correctly identifies GLM, OpenRouter, Anthropic, and custom backends
- [ ] Double-switching is idempotent
- [ ] Cross-switching (GLM -> OpenRouter, OpenRouter -> GLM) works cleanly
- [ ] Invalid/missing `settings.local.json` is handled gracefully
- [ ] `.claude/settings.local.json` is in `.gitignore`

---

## 12. Providers That Work With This Pattern

### Direct (no proxy needed)

| Provider | Base URL | Auth Key | Env Vars | Notes |
|----------|----------|----------|----------|-------|
| **Anthropic (native)** | (default) | (default) | 0 | No switching needed |
| **GLM** | `https://api.z.ai/api/anthropic` | GLM API key | 5 | Direct Anthropic-compatible proxy |
| **OpenRouter** | `https://openrouter.ai/api` | OpenRouter API key | 6 | "Anthropic Skin" -- native Anthropic protocol support |

### Via OpenRouter (no additional proxy needed)

OpenRouter acts as a universal adapter. Any model it supports can be used by setting the appropriate `provider/model-name` in the model override vars:

| Provider | Example Model Name | Notes |
|----------|--------------------|-------|
| DeepSeek | `deepseek/deepseek-r1-0528-v3-0324` | Via OpenRouter translation |
| Google Gemini | `google/gemini-2.5-pro` | Via OpenRouter translation |
| OpenAI | `openai/gpt-4o` | Via OpenRouter translation |
| Meta Llama | `meta-llama/llama-3.1-405b-instruct` | Via OpenRouter translation |
| Mistral | `mistralai/mistral-large` | Via OpenRouter translation |

### Won't work with this pattern

| Provider | Why |
|----------|-----|
| AWS Bedrock | Different auth mechanism (AWS Sig4), not simple API key |
| Google Vertex AI | Different auth mechanism (Google OAuth) |
| Azure AI | Different auth mechanism (Azure AD) |

---

## 13. Generalized Switching Pattern

Every provider switch follows the same 3-step pattern:

1. **Template**: A JSON file with the env var overrides and a key placeholder
2. **Key storage**: A dotenv file at `~/.config/gymrats/.env.<provider>` (chmod 600)
3. **Switch script**: Reads key, substitutes into template, merges into `settings.local.json`

Adding a new direct-compatible provider is always: one template + one save script + one switch script. The revert (`switch-claude.sh`) and status scripts are shared across all providers.

For providers accessible only through OpenRouter, no new scripts are needed -- just edit the model names in `openrouter-template.json`.

Sources:
- [OpenRouter Claude Code Integration](https://openrouter.ai/docs/guides/guides/claude-code-integration)
- [OpenRouter API Reference](https://openrouter.ai/docs/api/reference/overview)
